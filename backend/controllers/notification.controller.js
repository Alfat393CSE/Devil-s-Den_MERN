import Notification from '../models/notification.model.js';

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    console.error('Error listing notifications', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

export const markRead = async (req, res) => {
  const { id } = req.params;
  try {
    await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error marking notification read', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}
