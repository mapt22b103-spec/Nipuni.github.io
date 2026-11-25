/* ==========================================================================
           Party Pack Creator - Application Engine (Sri Lankan Rupee Edition)
           Handles dynamic pricing in Rs., guest counts, volume discounts, & budget auto-fit
           ========================================================================== */

        // Global State Variables (Values in LKR - Rs.)
        let currentOccasion = "Wedding";
        let baseCost = 1600;

        let currentPalette = "Blush Pink & Gold";
        let colorHex = "#FAD0C4";
        let colorCost = 250;

        let activeFillers = [
            { name: "Gourmet Chocolates", price: 750 },
            { name: "Butterfly Charm Keyring", price: 1000 }
        ];

        // Format Number to Sri Lankan Rupee String
        function formatRs(amount) {
            return "Rs. " + amount.toLocaleString('en-US');
        }

        // Initialize default state on page load
        document.addEventListener("DOMContentLoaded", () => {
            updatePreviewText();
            updateCalculations();
        });

        // Step 1: Occasion Selection
        function setOccasion(name, price, element) {
            currentOccasion = name;
            baseCost = price;
            
            if(element) {
                let siblings = element.parentElement.children;
                for (let child of siblings) child.classList.remove('active');
                element.classList.add('active');
            }

            document.getElementById("prevTitle").innerText = name + " Favor Box";
            document.getElementById("baseCostDisplay").innerText = formatRs(price);
            
            updateCalculations();
        }

        // Preset Loader for Occasion Gallery Cards
        function loadPreset(occasionName, startingPrice) {
            let builderSection = document.getElementById('builder');
            builderSection.scrollIntoView({ behavior: 'smooth' });
            
            // Highlight matching box in step 1
            let optionBoxes = document.querySelectorAll('.step-card:first-child .option-box');
            for(let box of optionBoxes) {
                if(box.innerText.includes(occasionName) || (occasionName === 'Birthday Party' && box.innerText.includes('Birthday'))) {
                    setOccasion(occasionName, Math.round(startingPrice * 0.45), box);
                    break;
                }
            }
        }

        // Step 2: Color Palette Selection
        function setColor(name, hex, price, element) {
            currentPalette = name;
            colorHex = hex;
            colorCost = price;

            if(element) {
                let siblings = element.parentElement.children;
                for (let child of siblings) child.classList.remove('active');
                element.classList.add('active');
            }

            let boxPreview = document.getElementById("boxPreview");
            boxPreview.style.backgroundColor = hex;
            document.getElementById("prevColorLabel").innerText = name;
            document.getElementById("colorCostDisplay").innerText = formatRs(price);

            updateCalculations();
        }

        // Step 3: Content Items Toggle
        function toggleFiller(name, price, element) {
            if(element) element.classList.toggle('active');

            let index = activeFillers.findIndex(item => item.name === name);
            if (index > -1) {
                activeFillers.splice(index, 1);
            } else {
                activeFillers.push({ name: name, price: price });
            }

            updateCalculations();
        }

        // Step 4 & 5: Live Text & Dynamic Pricing Calculations
        function updatePreviewText() {
            let names = document.getElementById("hostNames").value || "Lakshan & Anjali";
            let date = document.getElementById("eventDate").value || "04th October 2026 • Colombo";

            document.getElementById("prevMonogram").innerText = names;
            document.getElementById("prevDate").innerText = date;
        }

        function updateCalculations() {
            // Fillers total calculation
            let fillersSubtotal = activeFillers.reduce((sum, item) => sum + item.price, 0);
            document.getElementById("fillersCostDisplay").innerText = formatRs(fillersSubtotal);

            // Unit Price per pack
            let unitPrice = baseCost + colorCost + fillersSubtotal;
            document.getElementById("unitPriceDisplay").innerText = formatRs(unitPrice);

            // Guest quantity & volume discount calculation
            let guests = parseInt(document.getElementById("guestInput").value) || 1;
            document.getElementById("guestCountDisplay").innerText = guests + " Packs";

            let rawTotal = unitPrice * guests;
            let discount = 0;

            // Volume discount tiers (5% over 50, 10% over 100)
            if (guests >= 100) {
                discount = rawTotal * 0.10;
                document.getElementById("discountRow").style.display = "flex";
                document.getElementById("discountDisplay").innerText = "-" + formatRs(discount) + " (10%)";
            } else if (guests >= 50) {
                discount = rawTotal * 0.05;
                document.getElementById("discountRow").style.display = "flex";
                document.getElementById("discountDisplay").innerText = "-" + formatRs(discount) + " (5%)";
            } else {
                document.getElementById("discountRow").style.display = "none";
            }

            let grandTotal = rawTotal - discount;
            document.getElementById("grandTotalDisplay").innerText = formatRs(grandTotal);

            checkBudgetStatus();
        }

        // Budget Builder Auto-Check
        function checkBudgetStatus() {
            let budget = parseFloat(document.getElementById("budgetInput").value) || 0;
            let grandTotalText = document.getElementById("grandTotalDisplay").innerText.replace(/[^0-9.]/g, '');
            let total = parseFloat(grandTotalText) || 0;
            
            let budgetAlert = document.getElementById("budgetAlert");
            if (total <= budget) {
                budgetAlert.style.backgroundColor = "#E8F8F5";
                budgetAlert.style.color = "#27AE60";
                budgetAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Within your ${formatRs(budget)} budget target!`;
            } else {
                budgetAlert.style.backgroundColor = "#FDEDEC";
                budgetAlert.style.color = "#E74C3C";
                budgetAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Exceeds budget target by ${formatRs(total - budget)}`;
            }
        }

        // Auto-Fit Selection to Target Budget Algorithm
        function autoRecommendBudget() {
            let targetBudget = parseFloat(document.getElementById("budgetInput").value) || 150000;
            let guests = parseInt(document.getElementById("guestInput").value) || 50;

            let targetPerUnit = targetBudget / guests;

            if (targetPerUnit < 2000) {
                activeFillers = [{ name: "Custom Floral Calligraphy Tag", price: 300 }];
            } else if (targetPerUnit < 3500) {
                activeFillers = [
                    { name: "Gourmet Chocolates", price: 750 },
                    { name: "Custom Floral Calligraphy Tag", price: 300 }
                ];
            } else {
                activeFillers = [
                    { name: "Gourmet Chocolates", price: 750 },
                    { name: "Butterfly Charm Keyring", price: 1000 }
                ];
            }

            // Sync UI active classes for step 3
            let fillerBoxes = document.querySelectorAll('.step-card:nth-child(3) .option-box');
            for(let box of fillerBoxes) {
                let boxText = box.innerText;
                let isActive = activeFillers.some(f => boxText.includes(f.name.split(" ")[0]));
                if(isActive) box.classList.add('active');
                else box.classList.remove('active');
            }
            
            updateCalculations();
        }

        // Order Submission Handler
        function submitOrder() {
            let total = document.getElementById("grandTotalDisplay").innerText;
            let guests = document.getElementById("guestCountDisplay").innerText;
            let names = document.getElementById("prevMonogram").innerText;

            alert(`🎉 Order Submitted Successfully to Studio!

Order Details:
• Customer: ${names}
• Occasion: ${currentOccasion}
• Quantity: ${guests}
• Estimated Total: ${total}

Our Colombo team will contact you via WhatsApp for delivery confirmation!`);
            
            let ordersSection = document.getElementById('orders');
            ordersSection.scrollIntoView({ behavior: 'smooth' });
        }