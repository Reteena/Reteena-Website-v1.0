document.addEventListener('DOMContentLoaded', () => {
    // Set the launch date (40 days from today initially)
    const calculateLaunchDate = () => {
        const now = new Date();
        const launchDate = new Date();
        launchDate.setDate(now.getDate() + 40);
        return launchDate;
    };
    
    let launchDate = calculateLaunchDate();
    
    // Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const dayCountEl = document.getElementById('day-count');
    
    // Countdown function
    const updateCountdown = () => {
        const now = new Date();
        const diff = launchDate - now;
        
        // Calculate time values
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Update the day count
        dayCountEl.textContent = days;
        
        // Function to update a flip card with animation
        const updateFlipCard = (element, value) => {
            // Convert to string and pad with leading zero if needed
            const displayValue = String(value).padStart(2, '0');
            
            // Get current displayed value
            const currentTop = element.querySelector('.top').textContent;
            const currentBottom = element.querySelector('.bottom').textContent;
            
            // Only update if the value has changed
            if (displayValue !== currentTop) {
                // Add flip class to trigger animation
                element.classList.add('flip');
                
                // Update the values
                setTimeout(() => {
                    element.querySelector('.top').textContent = displayValue;
                    element.querySelector('.bottom').textContent = displayValue;
                    
                    // Remove flip class after animation completes
                    setTimeout(() => {
                        element.classList.remove('flip');
                    }, 500);
                }, 250);
            }
        };
        
        // Update all flip cards
        updateFlipCard(daysEl, days);
        updateFlipCard(hoursEl, hours);
        updateFlipCard(minutesEl, minutes);
        updateFlipCard(secondsEl, seconds);
    };
    
    // Initialize countdown
    updateCountdown();
    
    // Update countdown every second
    setInterval(updateCountdown, 1000);
    
    // Special feature: Every day at midnight, update the launch date so it always shows the correct "D-X" count
    const checkForDayChange = () => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            // It's midnight, update the launch date to maintain the same day count display
            // This ensures the page always shows the same countdown number each day
            launchDate = calculateLaunchDate();
        }
    };
    
    // Check every minute if we need to update the launch date
    setInterval(checkForDayChange, 60000);
    
    // Form submission handler
    const form = document.getElementById('signup-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            alert(`Thank you! We'll notify ${email} when we launch.`);
            e.target.reset();
        });
    }
});