import moment from 'moment';

import { RIDE_ROLES, ERIDE_ROLE } from '../models/PartnerSearch.js';

const HOUR_REGEX = /^(flexible|([01]\d|2[0-3]):[0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const validateSearchInput = (body) => {
  const { cragIds, date, leaveHomeHour, leaveCragHour, rideRole, leaveFromAddress } = body;
  const errors = {};

  if (!Array.isArray(cragIds) || cragIds.length === 0) {
    errors.cragIds = 'is required';
  }

  if (!date || !DATE_REGEX.test(date) || !moment.utc(date, 'YYYY-MM-DD', true).isValid()) {
    errors.date = 'is invalid';
  }

  if (!rideRole || !RIDE_ROLES.includes(rideRole)) {
    errors.rideRole = 'is invalid';
  }

  if (rideRole !== ERIDE_ROLE.SELF && (!leaveFromAddress || !leaveFromAddress.trim())) {
    errors.leaveFromAddress = 'is required';
  }

  if (!leaveHomeHour || !HOUR_REGEX.test(leaveHomeHour)) {
    errors.leaveHomeHour = 'is invalid';
  }

  if (!leaveCragHour || !HOUR_REGEX.test(leaveCragHour)) {
    errors.leaveCragHour = 'is invalid';
  }

  return Object.keys(errors).length ? errors : null;
};
