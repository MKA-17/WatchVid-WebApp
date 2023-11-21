export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }

export function formatViews(views) {
    const abbreviations = ['K', 'M', 'B', 'T'];
    const threshold = 1000;
    
    for (let i = abbreviations.length - 1; i >= 0; i--) {
      const multiplier = Math.pow(10, (i + 1) * 3);
      if (views >= multiplier) {
        return (views / multiplier).toFixed(1) + abbreviations[i];
      }
    }
    return views.toString();
  }
  
 
  