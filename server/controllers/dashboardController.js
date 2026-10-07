const { all, get } = require('../database/db');

const getDashboardStats = async (req, res) => {
  try {
    const totalTasks = await get('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?', [req.user.id]);
    const pendingTasks = await get('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = ?', [req.user.id, 'Pending']);
    const completedTasks = await get('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = ?', [req.user.id, 'Completed']);
    const highPriorityTasks = await get('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND priority = ?', [req.user.id, 'High']);
    const totalSubjects = await get('SELECT COUNT(*) AS total FROM subjects WHERE user_id = ?', [req.user.id]);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = await get(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? AND date LIKE ?`,
      [req.user.id, `${currentMonth}%`]
    );

    const upcomingTasks = await all(
      `SELECT t.*, s.name AS subject_name
       FROM tasks t
       LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE t.user_id = ? AND t.status = 'Pending' AND t.due_date IS NOT NULL
       ORDER BY t.due_date ASC
       LIMIT 5`,
      [req.user.id]
    );

    const recentExpenses = await all(
      `SELECT * FROM expenses
       WHERE user_id = ?
       ORDER BY date DESC, created_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    const taskCompletionRate = totalTasks.total === 0 ? 0 : Math.round((completedTasks.total / totalTasks.total) * 100);

    return res.json({
      success: true,
      data: {
        totalTasks: totalTasks.total,
        pendingTasks: pendingTasks.total,
        completedTasks: completedTasks.total,
        highPriorityTasks: highPriorityTasks.total,
        totalSubjects: totalSubjects.total,
        monthlyExpenses: Number(monthlyExpenses.total || 0),
        completionRate: taskCompletionRate,
        upcomingTasks,
        recentExpenses,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Could not load dashboard statistics.' });
  }
};

module.exports = {
  getDashboardStats,
};
