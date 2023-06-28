// Function to pad single-digit numbers with a leading zero
const padZero = (number) => {
  return number.toString().padStart(2, "0");
};

module.exports.formatDateTime = (dateString, format = "YYYY-MM-DD HH:mm") => {
  // Convert the second string to a Date object
  let date = new Date(dateString);

  let year = date.getFullYear();
  let month = padZero(date.getMonth() + 1);
  let day = padZero(date.getDate());
  let hour = padZero(date.getHours());
  let minute = padZero(date.getMinutes());

  format = format.replace("YYYY", year);
  format = format.replace("MM", month);
  format = format.replace("DD", day);
  format = format.replace("HH", hour);
  format = format.replace("mm", minute);

  return format;
};
