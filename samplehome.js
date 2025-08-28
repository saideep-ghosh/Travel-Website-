 document.addEventListener('DOMContentLoaded', () => {
            // Get all necessary elements by their IDs
            const homePage = document.getElementById('home-page');
            const loginPage = document.getElementById('login-page'); // The new login page container
            const loginBtn = document.getElementById('login-btn'); // Button on homepage to open login
            const backToHomeFromLoginBtnNew = document.getElementById('back-to-home-from-login-btn-new'); // New back to home button on login
            const tripPlanForm = document.getElementById('trip-plan-form');
            const errorMsg = document.getElementById('error-msg'); // Error message div on new login page
            
            const messageBox = document.getElementById('message-box');
            const messageText = document.getElementById('message-text');

            const recommendationSection = document.getElementById('recommendation-section');
            const recommendationGrid = document.getElementById('recommendation-grid');
            const itinerarySection = document.getElementById('itinerary-section');
            const itineraryTitle = document.getElementById('itinerary-title');
            const itineraryContent = document.getElementById('itinerary-content');

            /**
             * Shows a custom message box with a given message and color.
             * @param {string} message The message to display.
             * @param {string} type The type of message ('success' or 'error' or 'info').
             */
            function showMessage(message, type) {
                messageText.textContent = message;
                
                // Set the background color based on the message type
                if (type === 'success') {
                    messageBox.style.backgroundColor = '#10B981'; // Green-500
                } else if (type === 'error') {
                    messageBox.style.backgroundColor = '#EF4444'; // Red-500
                } else {
                    messageBox.style.backgroundColor = '#3B82F6'; // Blue-500 for info
                }

                // Show the message box with a smooth transition
                messageBox.classList.remove('translate-y-full', 'opacity-0');
                messageBox.classList.add('translate-y-0', 'opacity-100');

                // Hide the message box after 3 seconds
                setTimeout(() => {
                    messageBox.classList.remove('translate-y-0', 'opacity-100');
                    messageBox.classList.add('translate-y-full', 'opacity-0');
                }, 3000);
            }

            /**
             * Transitions to a specified page view.
             * @param {HTMLElement} currentPage The page element to hide.
             * @param {HTMLElement} nextPage The page element to show.
             */
            function showPage(currentPage, nextPage) {
                currentPage.style.opacity = '0';
                setTimeout(() => {
                    currentPage.classList.add('hidden');
                    nextPage.classList.remove('hidden');
                    setTimeout(() => {
                        nextPage.style.opacity = '1';
                    }, 10); // Small delay to allow 'hidden' class removal to register before opacity transition
                }, 500);
            }

            // Event listener for the "Login" button on the home page
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    errorMsg.textContent = ""; // Clear any previous error messages
                    showPage(homePage, loginPage);
                });
            }

            // Event listener for the "Back to Home" button on the NEW login page
            if (backToHomeFromLoginBtnNew) {
                backToHomeFromLoginBtnNew.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default link behavior
                    showPage(loginPage, homePage);
                });
            }

            /**
             * Handles the login form submission for the new login page.
             * @param {Event} event The submit event.
             * @returns {boolean} Always false to prevent default form submission.
             */
            window.handleLoginSubmit = function(event) {
                event.preventDefault(); // Prevent default form submission

                let username = document.getElementById("username").value.trim();
                let password = document.getElementById("password").value.trim();
                
                errorMsg.textContent = ""; // Clear previous errors

                if (username === "" || password === "") {
                    errorMsg.textContent = "⚠ Please fill in all fields!";
                    showMessage("Please fill in all fields!", 'error');
                    return false;
                }

                // Demo check
                if (username === "admin" && password === "1234") {
                    showMessage("Login successful! Redirecting...", 'success');
                    // Instead of window.location.href, use showPage to go back to homepage
                    setTimeout(() => showPage(loginPage, homePage), 1500); 
                    return false; // prevent default form submission
                } else {
                    errorMsg.textContent = "❌ Invalid username or password!";
                    showMessage("Invalid username or password!", 'error');
                    return false;
                }
            };


            // Function to handle the API call and display recommendation
            async function getRecommendation(prompt) {
                let retryCount = 0;
                const maxRetries = 3;
                let delay = 1000;
                const apiKey = "AIzaSyBTsUGnyPTsuxESGQKTA4cCIHtZffvqaM0";
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                const payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                "travel_plans": {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            "title": { "type": "STRING" },
                                            "description": { "type": "STRING" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

                while (retryCount < maxRetries) {
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (response.status === 429) {
                            await new Promise(res => setTimeout(res, delay));
                            delay *= 2;
                            retryCount++;
                            continue;
                        }

                        const result = await response.json();
                        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

                        if (text) {
                            return JSON.parse(text);
                        } else {
                            throw new Error("API response was empty or malformed.");
                        }
                    } catch (error) {
                        console.error("API call failed:", error);
                        throw error;
                    }
                }
                throw new Error("API call failed after multiple retries.");
            }

            // Function to handle the API call for itinerary
            async function getItinerary(prompt) {
                let retryCount = 0;
                const maxRetries = 3;
                let delay = 1000;
                const apiKey = "AIzaSyBTsUGnyPTsuxESGQKTA4cCIHtZffvqaM0";
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                const payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                "title": { "type": "STRING" },
                                "days": {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            "day_title": { "type": "STRING" },
                                            "schedule": { "type": "STRING" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            
                while (retryCount < maxRetries) {
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
            
                        if (response.status === 429) {
                            await new Promise(res => setTimeout(res, delay));
                            delay *= 2;
                            retryCount++;
                            continue;
                        }

                        const result = await response.json();
                        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            
                        if (text) {
                            return JSON.parse(text);
                        } else {
                            throw new Error("API response was empty or malformed.");
                        }
                    } catch (error) {
                        console.error("API call for itinerary failed:", error);
                        throw error;
                    }
                }
                throw new Error("API call for itinerary failed after multiple retries.");
            }
            
            // Event listener for the trip planning form submission
            if (tripPlanForm) {
                tripPlanForm.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const travelers = document.getElementById('travelers').value;
                    const startDate = document.getElementById('start-date').value;
                    const endDate = document.getElementById('end-date').value;
                    const budget = document.getElementById('budget').value;
                    
                    if (!travelers || !startDate || !endDate || !budget) {
                        showMessage("Please fill out all trip details.", 'error');
                        return;
                    }

                    // Hide itinerary section if it was shown
                    itinerarySection.classList.add('hidden');

                    // Show loading state and scroll to the recommendation section
                    recommendationSection.classList.remove('hidden');
                    recommendationGrid.innerHTML = `
                        <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center">
                            <div class="flex flex-col items-center justify-center space-y-4">
                                <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                                <p class="text-gray-500 text-lg animate-pulse">Finding your perfect adventures...</p>
                            </div>
                        </div>
                    `;
                    window.scrollTo({
                        top: recommendationSection.offsetTop,
                        behavior: 'smooth'
                    });

                    // Construct a prompt for the AI model asking for a list of 5 suggestions
                    const prompt = `Suggest 5 unique travel plans. For each plan, provide a compelling and creative title (e.g., "Swiss Alps Adventure") and a brief, engaging description (a single paragraph). The travel parameters are: ${travelers} travelers, from ${startDate} to ${endDate}, with a budget of $${budget}. The output MUST be a JSON object with a single key "travel_plans" containing an array of objects with "title" and "description" keys.`;

                    try {
                        const responseData = await getRecommendation(prompt);
                        
                        // Clear the loading indicator
                        recommendationGrid.innerHTML = '';
                        
                        if (responseData && responseData.travel_plans && responseData.travel_plans.length > 0) {
                            responseData.travel_plans.forEach(plan => {
                                const cardHTML = `
                                    <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 flex flex-col">
                                        <div class="p-6 flex-grow">
                                            <h3 class="text-xl font-bold text-gray-800 mb-2">${plan.title}</h3>
                                            <p class="text-gray-600 mb-4">${plan.description}</p>
                                        </div>
                                        <div class="p-4 bg-gray-50 border-t border-gray-200">
                                            <button onclick="generateItinerary('${plan.title}', '${plan.description}')" class="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-indigo-700 transition-colors shadow-md">
                                                Generate Itinerary ✨
                                            </button>
                                        </div>
                                    </div>
                                `;
                                recommendationGrid.innerHTML += cardHTML;
                            });
                        } else {
                            throw new Error("No travel plans were returned from the API.");
                        }

                    } catch (error) {
                         // Fallback error message for the user
                        recommendationGrid.innerHTML = `
                            <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center">
                                <p class="text-red-500 font-bold">Failed to generate recommendations.</p>
                                <p class="text-gray-600 mt-2">The trip planner is experiencing a temporary issue. Please try again later!</p>
                            </div>
                        `;
                        showMessage("Failed to plan your trip. Please try again.", 'error');
                        console.error("Error generating recommendations:", error);
                    }
                });
            }

            // Function for the "Generate Itinerary" button
            window.generateItinerary = async (tripTitle, tripDescription) => {
                // Show loading state in itinerary section
                itinerarySection.classList.remove('hidden');
                itineraryTitle.textContent = `Itinerary for: ${tripTitle}`;
                itineraryContent.innerHTML = `
                    <div class="text-center">
                        <div class="flex flex-col items-center justify-center space-y-4">
                            <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                            <p class="text-gray-500 text-lg animate-pulse">Building your itinerary...</p>
                        </div>
                    </div>
                `;
                window.scrollTo({
                    top: itinerarySection.offsetTop,
                    behavior: 'smooth'
                });

                const prompt = `Create a detailed day-by-day itinerary for a trip titled "${tripTitle}" with the following description: "${tripDescription}". Organize it into an array of objects, where each object has a "day_title" (e.g., "Day 1: Arrival & City Exploration") and a "schedule" (a detailed paragraph of activities for that day). The final output MUST be a JSON object with a "title" and a "days" key containing the array.`;

                try {
                    const itineraryData = await getItinerary(prompt);
                    
                    if (itineraryData && itineraryData.days && itineraryData.days.length > 0) {
                        let htmlContent = '';
                        itineraryData.days.forEach(day => {
                            htmlContent += `
                                <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 last:mb-0">
                                    <h4 class="text-xl font-bold text-gray-800 mb-2">${day.day_title}</h4>
                                    <p class="text-gray-600">${day.schedule}</p>
                                </div>
                            `;
                        });
                        itineraryContent.innerHTML = htmlContent;
                    } else {
                        throw new Error("No itinerary data was returned from the API.");
                    }
                } catch (error) {
                    itineraryContent.innerHTML = `
                        <div class="text-center">
                            <p class="text-red-500 font-bold">Failed to generate an itinerary.</p>
                            <p class="text-gray-600 mt-2">The itinerary planner is experiencing a temporary issue. Please try again later!</p>
                        </div>
                    `;
                    showMessage("Failed to generate itinerary. Please try again.", 'error');
                    console.error("Error generating itinerary:", error);
                }
            };

            // Function for the "Book This Trip" button (placeholder)
            window.bookTrip = (tripTitle) => {
                showMessage(`Successfully booked your trip: ${tripTitle}`, 'success');
            };
        });
  