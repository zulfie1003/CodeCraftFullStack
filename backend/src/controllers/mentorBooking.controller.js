import MentorBooking from '../models/MentorBooking.model.js';
import { getMentorById } from '../config/mentors.js';
import { sendMentorBookingEmails } from '../utils/email.js';
import { sendSuccess, sendError } from '../utils/response.js';

const emailRegex = /^\S+@\S+\.\S+$/;

const normalizeText = (value = '') => value.trim();

const toNotificationPayload = (booking) => ({
  id: booking._id,
  mentorName: booking.mentorName,
  studentName: booking.studentName,
  studentEmail: booking.studentEmail,
  studentPhone: booking.studentPhone,
  queryCategory: booking.queryCategory,
  topic: booking.topic,
  notes: booking.notes,
  preferredDate: booking.preferredDate,
  timezone: booking.timezone,
  duration: booking.duration,
  meetingMode: booking.meetingMode,
});

export const createMentorBooking = async (req, res, next) => {
  try {
    const mentor = getMentorById(req.body.mentorId);

    if (!mentor) {
      return sendError(res, 'Please select a valid mentor', 400);
    }

    const studentName = normalizeText(req.body.studentName || req.user?.name || '');
    const studentEmail = normalizeText(req.body.studentEmail || req.user?.email || '').toLowerCase();
    const studentPhone = normalizeText(req.body.studentPhone || '');
    const queryCategory = normalizeText(req.body.queryCategory || '');
    const topic = normalizeText(req.body.topic || '');
    const notes = normalizeText(req.body.notes || '');
    const timezone = normalizeText(req.body.timezone || 'UTC');
    const meetingMode = normalizeText(req.body.meetingMode || '');
    const duration = Number(req.body.duration);
    const preferredDate = new Date(req.body.preferredDate);

    if (!studentName || !studentEmail || !studentPhone || !queryCategory || !topic || !notes || !meetingMode) {
      return sendError(res, 'Please fill all booking form fields', 400);
    }

    if (!emailRegex.test(studentEmail)) {
      return sendError(res, 'Please enter a valid student email', 400);
    }

    if (!mentor.categories.includes(queryCategory)) {
      return sendError(res, 'Selected query category does not match this mentor', 400);
    }

    if (![30, 60, 90].includes(duration)) {
      return sendError(res, 'Please select a valid duration', 400);
    }

    if (Number.isNaN(preferredDate.getTime())) {
      return sendError(res, 'Please choose a valid preferred date and time', 400);
    }

    const booking = await MentorBooking.create({
      user: req.user._id,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorEmail: mentor.email,
      studentName,
      studentEmail,
      studentPhone,
      queryCategory,
      topic,
      notes,
      preferredDate,
      timezone,
      duration,
      meetingMode,
    });

    let emailStatus = {
      studentEmailSent: false,
      mentorEmailSent: false,
      skippedReason: '',
      lastError: '',
    };

    try {
      emailStatus = await sendMentorBookingEmails({
        ...toNotificationPayload(booking),
        mentorEmail: mentor.email,
      });
    } catch (error) {
      console.error('Mentor booking email error:', error.message || error);
      emailStatus = {
        studentEmailSent: false,
        mentorEmailSent: false,
        skippedReason: '',
        lastError: error.message || 'Failed to send booking notifications',
      };
    }

    booking.notificationStatus = emailStatus;
    await booking.save();

    return sendSuccess(
      res,
      {
        booking,
        emailStatus,
      },
      'Mentor session booked successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getMyMentorBookings = async (req, res, next) => {
  try {
    const bookings = await MentorBooking.find({ user: req.user._id }).sort({ createdAt: -1 });

    return sendSuccess(res, { bookings }, 'Mentor bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};
