import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { message: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignored
          }
        },
      },
    });

    // Fetch all reports
    const { data: reports, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        categories:category_id(id, name),
        users:user_id(id, name, email)
        `
      );

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        { message: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalIssues = reports?.length || 0;
    const pendingCount = reports?.filter(r => r.status.toLowerCase() === 'pending').length || 0;
    const inProgressCount = reports?.filter(
      r =>
        r.status.toLowerCase() === 'in_progress' ||
        r.status.toLowerCase() === 'in progress'
    ).length || 0;
    const resolvedCount = reports?.filter(r => r.status.toLowerCase() === 'resolved').length || 0;
    const rejectedCount = reports?.filter(r => r.status.toLowerCase() === 'rejected').length || 0;
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;

    // Last 7 days data
    const last7Days = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dayReports = reports?.filter(r => {
        const reportDate = new Date(r.created_at);
        return reportDate.toDateString() === date.toDateString();
      }).length || 0;
      last7Days.push({
        day: dayName,
        count: dayReports,
      });
    }

    // Status breakdown
    const statusBreakdown = {
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      rejected: rejectedCount,
    };

    // Top categories
    const categoryMap = new Map<string, number>();
    reports?.forEach(report => {
      const categoryName = report.categories?.name || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });
    const topCategories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Issue hotspots
    const hotspotMap = new Map<string, number>();
    reports?.forEach(report => {
      const location = report.address || 'Unknown';
      hotspotMap.set(location, (hotspotMap.get(location) || 0) + 1);
    });
    const hotspots = Array.from(hotspotMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const analyticsData = {
      totalIssues,
      pendingCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      resolutionRate,
      lastSevenDays: last7Days,
      statusBreakdown,
      topCategories,
      hotspots,
    };

    return NextResponse.json(
      {
        status: 'success',
        data: analyticsData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching analytics:', err);
    const errorMsg = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json(
      { message: errorMsg },
      { status: 500 }
    );
  }
}
