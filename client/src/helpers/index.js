
export const generateRandomID = () => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime(); // Get the current timestamp
    const randomID = `${timestamp}${Math.floor(Math.random() * 1000)}`; // Concatenate timestamp with a random number

    return randomID;
};
  
export const formatLapTime = (totalMilliseconds) => {
    // Convert milliseconds to minutes, seconds, and milliseconds
    let minutes = Math.floor(totalMilliseconds / 60000);
    let seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    let milliseconds = totalMilliseconds % 1000;
  
    // Pad seconds and milliseconds with leading zeros if necessary
    seconds = seconds.toString().padStart(2, '0');
    milliseconds = milliseconds.toString().padStart(3, '0');
  
    // Return formatted lap time as a string
    return `${minutes}:${seconds}.${milliseconds}`;
};
  
