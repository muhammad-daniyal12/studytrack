const { get, run } = require('../database/db');

const getProfile = async (req, res) => {
  try {
    const user = await get(
      `SELECT id, name, email, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const totalTasks = await get('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?', [req.user.id]);
    const completedTasks = await get('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = ?', [req.user.id, 'Completed']);
    const totalSubjects = await get('SELECT COUNT(*) AS total FROM subjects WHERE user_id = ?', [req.user.id]);
    const totalExpenses = await get('SELECT COUNT(*) AS total FROM expenses WHERE user_id = ?', [req.user.id]);

    return res.json({
      success: true,
      data: {
        ...user,
        stats: {
          totalTasks: totalTasks.total,
          completedTasks: completedTasks.total,
          totalSubjects: totalSubjects.total,
          totalExpenses: totalExpenses.total,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    await run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);

    const updatedUser = await get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update profile.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
