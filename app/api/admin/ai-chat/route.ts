import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hfApiKey = process.env.HF_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface HFResponse {
  generated_text?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Step 1: Extract intent from user message (location, category, status)
    const intent = extractIntent(message);
    console.log('Extracted intent:', JSON.stringify(intent, null, 2));

    // Step 2: Validate intent - only fetch data for queries with clear intent
    const hasDataIntent: boolean = intent.type !== 'general' && 
                          (!!intent.location || !!intent.category || !!intent.status || 
                           !!intent.reportSearch || intent.type === 'users-query');

    let reports: any[] = [];
    let users: any[] = [];
    let context = '';

    if (hasDataIntent) {
      if (intent.type === 'users-query') {
        console.log('Fetching users...');
        users = await fetchUsers(intent);
        console.log(`Found ${users.length} users`);
        context = formatUsersForContext(users);
      } else if (intent.type === 'specific-report') {
        // Search for a specific report by title or ID
        console.log(`Searching for specific report: ${intent.reportSearch}`);
        reports = await fetchSpecificReport(intent.reportSearch!);
        console.log(`Found ${reports.length} specific reports`);
        context = formatReportsForContext(reports);
      } else {
        // Fetch reports based on location, category, status, etc.
        console.log(`Fetching reports with intent type: ${intent.type}`, {
          location: intent.location,
          category: intent.category,
          status: intent.status,
        });
        reports = await fetchReports(intent);
        console.log(`Found ${reports.length} reports`);
        context = formatReportsForContext(reports);
      }
    } else {
      console.log('No clear data intent detected - providing general assistance');
      context = 'No specific reports or users requested.';
    }

    // Step 3: Format data for AI context
    const reportContext = context;

    // Step 4: Create enhanced prompt with report data
    const enhancedPrompt = `You are a helpful AI assistant for a Smart City Reporting system admin dashboard.

Available Reports/Users:
${reportContext}

User Question: ${message}

Provide a helpful response that:
1. Lists relevant reports if the user asked for them
2. Provides insights and summaries
3. Suggests actions or next steps
4. Is concise and professional
5. If no specific query was made, provide helpful guidance on how to use the system

Response:`;

    // Step 5: Call Hugging Face API for conversational response
    const aiResponse = await callHuggingFaceAPI(enhancedPrompt, hasDataIntent);

    return NextResponse.json({
      status: 'success',
      response: aiResponse,
      reports: reports.length > 0 ? reports.slice(0, 10) : [],
      users: users.length > 0 ? users.slice(0, 20) : [],
      intent,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

function extractIntent(message: string) {
  const lower = message.toLowerCase();
  const intent = {
    location: null as string | null,
    category: null as string | null,
    status: null as string | null,
    verified: null as boolean | null,
    reportSearch: null as string | null,
    type: 'general' as string,
    hasQueryKeyword: false,
  };

  // Check for query keywords - must have at least one to be considered a real query
  const queryKeywords = ['show', 'list', 'get', 'find', 'search', 'how many', 'count', 'total', 'details', 'which', 'what', 'tell me', 'report', 'user', 'verified'];
  const hasQueryKeyword = queryKeywords.some(keyword => lower.includes(keyword));
  intent.hasQueryKeyword = hasQueryKeyword;

  // If no query keyword detected, it's just a general message
  if (!hasQueryKeyword) {
    return intent;
  }

  // Check if query is about users
  if (lower.includes('user') || (lower.includes('verified') && (lower.includes('show') || lower.includes('list')))) {
    intent.type = 'users-query';
    if (lower.includes('not verified') || lower.includes('unverified')) {
      intent.verified = false;
    } else if (lower.includes('verified')) {
      intent.verified = true;
    }
    return intent;
  }

  // Location extraction - High priority, check FIRST
  // Patterns: "in X", "for X", "inside X", "at X", "from X", "near X", "within X"
  const locationMatch = message.match(/(?:in|for|inside|at|from|near|within)\s+([A-Za-z0-9\s]+?)(?:\s+location|\s+area|$|\?|\.)/i);
  if (locationMatch) {
    let location = locationMatch[1].trim();
    // Remove common trailing words that shouldn't be part of location name
    location = location.replace(/\s+(report|reports|details|issue|issues)$/i, '');
    if (location && location.length > 2) {
      intent.location = location;
      intent.type = 'location-based';
      return intent;
    }
  }

  // Check if query is about a SPECIFIC REPORT by title
  // Patterns: "show me report X", "details of X", "tell me about X", "report X"
  // Only match if NOT asking about "all" and it's a single word/name after the verb
  const reportMatch = message.match(/(?:show me|details of|tell me about|report|information on|show)\s+(?:the\s+)?([A-Za-z0-9\-_]+)(?:\s|$)/i);
  if (reportMatch && !lower.includes('all reports') && !lower.includes(' for ') && !lower.includes(' in ')) {
    const term = reportMatch[1].trim();
    // Don't treat common words as report names
    if (!['a', 'the', 'details', 'all', 'report', 'reports', 'me'].includes(term.toLowerCase()) && term.length > 2) {
      intent.reportSearch = term;
      intent.type = 'specific-report';
      return intent;
    }
  }

  // Category extraction
  const categories = ['infrastructure', 'safety', 'sanitation', 'traffic', 'parks', 'recreation', 'pothole', 'street light', 'tree', 'broken road', 'accident', 'flooding'];
  for (const cat of categories) {
    if (lower.includes(cat)) {
      intent.category = cat;
      intent.type = 'category-based';
      break;
    }
  }

  // Status extraction
  if (lower.includes('active') && !lower.includes('not active') && !lower.includes('inactive')) {
    intent.status = 'active';
    intent.type = 'status-based';
  } else if (lower.includes('not active') || lower.includes('inactive')) {
    intent.status = 'inactive';
    intent.type = 'status-based';
  } else if (lower.includes('pending') && !lower.includes('not pending')) {
    intent.status = 'pending';
    intent.type = 'status-based';
  } else if (lower.includes('progress') || lower.includes('in progress')) {
    intent.status = 'in_progress';
    intent.type = 'status-based';
  } else if ((lower.includes('resolved') || lower.includes('completed')) && !lower.includes('not resolved') && !lower.includes('not completed')) {
    intent.status = 'resolved';
    intent.type = 'status-based';
  }

  // Query type detection
  if (lower.includes('how many') || lower.includes('count') || lower.includes('total')) {
    intent.type = 'count-query';
  } else if (lower.includes('show') || lower.includes('list') || lower.includes('give me') || lower.includes('get') || lower.includes('details')) {
    intent.type = 'list-query';
  } else if (lower.includes('which') || lower.includes('what')) {
    intent.type = 'info-query';
  }

  return intent;
}

async function fetchReports(intent: any) {
  try {
    // Build the query with proper relationship handling
    let query = supabase
      .from('reports')
      .select('id, title, description, address, status, created_at, category_id, image_url, latitude, longitude, categories!reports_category_id_fkey(name)');

    // Filter by location if specified (use 'address' column, not 'location')
    if (intent.location) {
      console.log(`Filtering by location: ${intent.location}`);
      // Search flexibly in address, description, and title
      // This handles "Dupka2", "Dupka 2", "Street in Dupka2", etc.
      const searchTerm = intent.location;
      query = query.or(`address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
    }

    // Filter by category if specified
    if (intent.category) {
      console.log(`Filtering by category: ${intent.category}`);
      // Search in address, description, and title for category keywords
      query = query.or(`address.ilike.%${intent.category}%,description.ilike.%${intent.category}%,title.ilike.%${intent.category}%`);
    }

    // Filter by status if specified
    if (intent.status === 'active') {
      console.log('Filtering by status: active (pending or in_progress)');
      // Active means pending OR in_progress (NOT resolved)
      query = query.in('status', ['pending', 'in_progress']);
    } else if (intent.status === 'inactive') {
      console.log('Filtering by status: inactive (resolved)');
      // Inactive means resolved
      query = query.eq('status', 'resolved');
    } else if (intent.status) {
      console.log(`Filtering by status: ${intent.status}`);
      // For specific status (pending, in_progress, resolved)
      query = query.eq('status', intent.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    console.log(`Query returned ${data?.length || 0} reports`);
    if (data && data.length > 0) {
      console.log('Sample report data:', data.slice(0, 3).map((r: any) => ({
        title: r.title,
        address: r.address,
        description: r.description?.substring(0, 50)
      })));
    }
    return data || [];
  } catch (error) {
    console.error('Error in fetchReports:', error);
    return [];
  }
}

async function fetchSpecificReport(searchTerm: string) {
  try {
    // Search by title (case-insensitive)
    const query = supabase
      .from('reports')
      .select('id, title, description, address, status, created_at, category_id, image_url, latitude, longitude, categories!reports_category_id_fkey(name)')
      .ilike('title', `%${searchTerm}%`);

    const { data, error } = await query.limit(5);

    if (error) {
      console.error('Error fetching specific report:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchSpecificReport:', error);
    return [];
  }
}

function formatReportsForContext(reports: any[]) {
  if (reports.length === 0) {
    return 'No reports found matching the criteria.';
  }

  return reports
    .slice(0, 10)
    .map(
      (report, index) => `
${index + 1}. Title: ${report.title}
   Location: ${report.address || report.location || 'Unknown'}
   Category: ${report.categories?.name || 'Uncategorized'}
   Status: ${report.status}
   Description: ${report.description?.substring(0, 100)}...
   Created: ${new Date(report.created_at).toLocaleDateString()}
`
    )
    .join('\n');
}

async function fetchUsers(intent: any) {
  try {
    let query = supabase.from('users').select('id, email, email_verified, created_at, role');

    // Filter by verification status if specified
    if (intent.verified !== null) {
      query = query.eq('email_verified', intent.verified);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    return [];
  }
}

function formatUsersForContext(users: any[]) {
  if (users.length === 0) {
    return 'No users found matching the criteria.';
  }

  return users
    .slice(0, 20)
    .map(
      (user, index) => `
${index + 1}. Email: ${user.email}
   Verified: ${user.email_verified ? 'Yes ✓' : 'No ✗'}
   Role: ${user.role || 'User'}
   Created: ${new Date(user.created_at).toLocaleDateString()}
`
    )
    .join('\n');
}

async function callHuggingFaceAPI(prompt: string, hasDataIntent: boolean): Promise<string> {
  try {
    // Try with Mistral model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        headers: { Authorization: `Bearer ${hfApiKey}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.6,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(8000), // 8 second timeout
      }
    );

    if (response.ok) {
      const result: HFResponse[] = await response.json();

      if (result && result[0] && result[0].generated_text) {
        let text = result[0].generated_text;
        if (text.includes('Response:')) {
          text = text.split('Response:')[1].trim();
        }
        if (text.includes('User Question:')) {
          text = text.split('User Question:')[0].trim();
        }
        return text.trim() || 'I found relevant reports for your query.';
      }
    }

    console.log('HF API response status:', response.status);
  } catch (error) {
    console.log('HF API Error (expected for free tier):', error);
  }

  // Fallback: Generate a simple summary without AI
  return generateSimpleSummary(prompt, hasDataIntent);
}

function generateSimpleSummary(prompt: string, hasDataIntent: boolean): string {
  // If no data intent was detected, provide helpful guidance
  if (!hasDataIntent) {
    const greetings = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'goodbye', 'bye'];
    const isGreeting = greetings.some(g => prompt.toLowerCase().includes(g));
    
    if (isGreeting) {
      return 'Hello! I\'m your Smart City AI Assistant. I can help you with:\n' +
             '• Finding reports in specific locations\n' +
             '• Filtering by category (infrastructure, safety, sanitation, etc.)\n' +
             '• Checking report status (pending, in progress, resolved)\n' +
             '• Viewing user information\n\n' +
             'Try asking me something like "Show me reports in Skopje" or "List pending infrastructure issues".';
    }
    
    return 'I didn\'t understand a specific query. Please ask me about:\n' +
           '• Reports in a specific location\n' +
           '• Reports in a certain category\n' +
           '• Reports with a specific status\n' +
           '• User information\n\n' +
           'For example: "Show me all pending reports" or "List reports in Skopje"';
  }

  // Simple pattern matching for common queries when data intent exists
  
  // Check for specific report queries
  const reportMatch = prompt.match(/(?:report|details of|tell me about|show me)\s+(?:the\s+)?([A-Za-z0-9\-_]+)/i);
  if (reportMatch && !prompt.toLowerCase().includes('all')) {
    const reportName = reportMatch[1].trim();
    return `Here are the details for the ${reportName} report. Below you'll find all the information about this specific issue including its location, category, status, and description.`;
  }

  // Check for location-based queries first
  const locationMatch = prompt.match(/(?:in|from|at|near|inside|within)\s+([A-Za-z0-9\s]+?)(?:\s+and|,|\s+location|\s+details|\.|\?|$)/i);
  if (locationMatch) {
    const location = locationMatch[1].trim();
    return `Here are all reports for the ${location} location. These are all the issues reported in this area with their current status and details.`;
  }

  if (prompt.toLowerCase().includes('active')) {
    return 'Here are all active reports (pending or in progress). These are the issues that still need attention and have not been resolved yet.';
  }

  if (prompt.toLowerCase().includes('resolved') || prompt.toLowerCase().includes('completed')) {
    return 'Here are all resolved reports. These issues have been completed and closed.';
  }

  if (prompt.toLowerCase().includes('verified user')) {
    return 'Here are all verified users. These are users who have confirmed their email addresses.';
  }

  if (prompt.toLowerCase().includes('not verified') || prompt.toLowerCase().includes('unverified')) {
    return 'Here are all unverified users. These users have not yet confirmed their email addresses.';
  }

  if (prompt.toLowerCase().includes('how many')) {
    return 'Based on the reports found, I can see the count in the list below. Please review each report to get accurate numbers for your query.';
  }

  if (prompt.toLowerCase().includes('pending')) {
    return 'I found reports with pending status. These are awaiting review and action. Check the details below for more information on each issue.';
  }

  if (prompt.toLowerCase().includes('progress') || prompt.toLowerCase().includes('in progress')) {
    return 'Here are the reports currently in progress. These issues are being actively worked on. See the full details in the list below.';
  }

  if (prompt.toLowerCase().includes('list') || prompt.toLowerCase().includes('show') || prompt.toLowerCase().includes('details')) {
    return 'Here are the reports matching your specific criteria. Each one is displayed below with full details.';
  }

  // Default response for data queries
  return 'I found relevant reports matching your query. Here are the details below:';
}
