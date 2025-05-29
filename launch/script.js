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
    
    // Add terminal boot sequence effect
    const bootSequence = async () => {
        // Prepare elements for boot sequence
        const allElements = [
            daysEl.querySelector('.top'), 
            daysEl.querySelector('.bottom'),
            hoursEl.querySelector('.top'),
            hoursEl.querySelector('.bottom'),
            minutesEl.querySelector('.top'),
            minutesEl.querySelector('.bottom'),
            secondsEl.querySelector('.top'),
            secondsEl.querySelector('.bottom')
        ];
        
        // Hide all elements initially
        allElements.forEach(el => {
            el.style.opacity = '0';
        });
        
        // Function to simulate random digital noise
        const showNoise = (element) => {
            const randomDigit = () => Math.floor(Math.random() * 10);
            element.textContent = randomDigit();
        };
        
        // Simulate classic terminal boot sequence
        for (let i = 0; i < allElements.length; i++) {
            // Show element
            allElements[i].style.opacity = '1';
            
            // Display random digits rapidly to simulate "loading"
            const noiseInterval = setInterval(() => {
                showNoise(allElements[i]);
            }, 50);
            
            // Stop noise after a short delay
            await new Promise(r => setTimeout(() => {
                clearInterval(noiseInterval);
                allElements[i].textContent = '0';
                r();
            }, 400));
        }
    };
    
    // Execute boot sequence
    bootSequence();
    
    // Countdown function
    const updateCountdown = () => {
        const now = new Date();
        const diff = launchDate - now;
        
        // Calculate time values
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Function to update a flip card with animation
        const updateFlipCard = (element, value) => {
            // Convert to string and pad with leading zero if needed
            const displayValue = String(value).padStart(2, '0');
            
            // Get current displayed value
            const currentTop = element.querySelector('.top').textContent;
            
            // Only update if the value has changed
            if (displayValue !== currentTop) {
                // Add flip class to trigger animation
                element.classList.add('flip');
                
                // Add classic CRT digital noise effect
                const randomDigits = () => {
                    return Math.floor(Math.random() * 10).toString();
                };
                
                // Update with random noise first
                setTimeout(() => {
                    element.querySelector('.top').textContent = randomDigits();
                    element.querySelector('.bottom').textContent = randomDigits();
                    
                    // Then update with correct value
                    setTimeout(() => {
                        element.querySelector('.top').textContent = displayValue;
                        element.querySelector('.bottom').textContent = displayValue;
                        
                        // Remove flip class after animation completes
                        setTimeout(() => {
                            element.classList.remove('flip');
                        }, 250);
                    }, 100);
                }, 100);
            }
        };
        
        // Update all flip cards
        updateFlipCard(daysEl, days);
        updateFlipCard(hoursEl, hours);
        updateFlipCard(minutesEl, minutes);
        updateFlipCard(secondsEl, seconds);
    };
    
    // Start countdown after boot sequence (with delay)
    setTimeout(() => {
        // Initialize countdown
        updateCountdown();
        
        // Update countdown every second
        setInterval(updateCountdown, 1000);
    }, 3000);
    
    // Every day at midnight, update the launch date
    const checkForDayChange = () => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            launchDate = calculateLaunchDate();
        }
    };
    
    // Check every minute if we need to update the launch date
    setInterval(checkForDayChange, 60000);
});