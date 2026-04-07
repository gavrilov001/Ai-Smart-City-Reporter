import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getWeeklyDates() {
  const today = new Date();
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    week.push(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
  }
  return week;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function GET(request: Request) {
  try {
    // Fetch all reports for statistics
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, status, created_at, updated_at');

    if (reportsError) throw reportsError;

    // Count reports by status
    const totalReports = reports?.length || 0;
    const pendingReviews = reports?.filter(r => r.status === 'new' || r.status === 'pending').length || 0;
    const inProgress = reports?.filter(r => r.status === 'in_progress' || r.status === 'in progress').length || 0;
    const resolved = reports?.filter(r => r.status === 'resolved').length || 0;
    const rejected = reports?.filter(r => r.status === 'rejected').length || 0;

    // Get this week's report count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisWeekCount = reports?.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= sevenDaysAgo;
    }).length || 0;

    // Calculate weekly trend
    const weeklyDates = getWeeklyDates();
    const weeklyTrend = weeklyDates.map((date, index) => {
      const daySubmitted = reports?.filter(r => {
        const createdDate = new Date(r.created_at).toISOString().split('T')[0];
        return createdDate === date;
      }).length || 0;

      const dayResolved = reports?.filter(r => {
        const updatedDate = new Date(r.updated_at || r.created_at).toISOString().split('T')[0];
        return updatedDate === date && r.status === 'resolved';
      }).length || 0;

      return {
        day: dayNames[index],
        submitted: daySubmitted,
        resolved: dayResolved,
      };
    });

    // Fetch all users for active citizens count
    const { data: users } = await supabase
      .from('users')
      .select('id, role');

    const activeCitizens = users?.filter((u: any) => u.role !== 'administrator').length || 0;
    const admins = users?.filter((u: any) => u.role === 'administrator').length || 0;

    // Get average response time (days from created to resolved)
    const resolvedReports = reports?.filter(r => r.status === 'resolved') || [];
    let avgResponseTime = '2.3 hours';
    if (resolvedReports.length > 0) {
      const responseTimes = resolvedReports.map(r => {
        const created = new Date(r.created_at).getTime();
        const updated = new Date(r.updated_at || r.created_at).getTime();
        return (updated - created) / (1000 * 60 * 60); // in hours
      });
      const avgHours = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      if (avgHours < 24) {
        avgResponseTime = `${avgHours.toFixed(1)} hours`;
      } else {
        avgResponseTime = `${(avgHours / 24).toFixed(1)} days`;
      }
    }

    // Mock analytics data with real counts
    const analytics = {
      weeklyTrend,
      statusDistribution: [
        { name: 'Pending', value: pendingReviews, color: '#FCD34D' },
        { name: 'In Progress', value: inProgress, color: '#06B6D4' },
        { name: 'Resolved', value: resolved, color: '#10B981' },
        { name: 'Rejected', value: rejected, color: '#EF4444' },
      ],
      totalReports,
      pendingReviews,
      inProgress,
      resolved,
      rejected,
      activeCitizens,
      avgResponseTime,
      thisWeek: thisWeekCount,
      admins,
    };

    return NextResponse.json(
      {
        status: 'success',
        data: analytics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch analytics data',
      },
      { status: 500 }
    );
  }
}
