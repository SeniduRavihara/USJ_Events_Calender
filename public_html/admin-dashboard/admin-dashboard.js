let currentEventId = null;
        let editMode = false;

        // Sample events data
        const events = [
            { id: 1, title: 'AI Workshop Series', department: 'cs', description: 'Introduction to Machine Learning fundamentals', date: '2025-06-25', time: '14:00', location: 'Lab 301', maxReg: 50, currentReg: 45 },
            { id: 2, title: 'Software Architecture Seminar', department: 'se', description: 'Best practices in modern software architecture', date: '2025-06-28', time: '10:00', location: 'Auditorium A', maxReg: 100, currentReg: 32 },
            { id: 3, title: 'Database Design Competition', department: 'is', description: 'Annual database design challenge', date: '2025-07-02', time: '09:00', location: 'Computer Lab 2', maxReg: 30, currentReg: 28 }
        ];

        function openCreateModal() {
            document.getElementById('modalTitle').textContent = 'Create New Event';
            document.getElementById('submitBtn').textContent = 'Create Event';
            document.getElementById('eventForm').reset();
            editMode = false;
            currentEventId = null;
            document.getElementById('eventModal').style.display = 'block';
        }

        function editEvent(eventId) {
            const event = events.find(e => e.id === eventId);
            if (!event) return;

            document.getElementById('modalTitle').textContent = 'Edit Event';
            document.getElementById('submitBtn').textContent = 'Update Event';
            
            // Populate form with event data
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDepartment').value = event.department;
            document.getElementById('eventDescription').value = event.description;
            document.getElementById('eventDate').value = event.date;
            document.getElementById('eventTime').value = event.time;
            document.getElementById('eventLocation').value = event.location;
            document.getElementById('eventMaxReg').value = event.maxReg;
            
            editMode = true;
            currentEventId = eventId;
            document.getElementById('eventModal').style.display = 'block';
        }

        function deleteEvent(eventId) {
            if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
                if (eventCard) {
                    eventCard.style.opacity = '0.5';
                    eventCard.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        eventCard.remove();
                        showNotification('Event deleted successfully!', 'success');
                    }, 200);
                }
            }
        }

        function viewEvent(eventId) {
            alert(`Viewing details for event ${eventId}. In a real application, this would open a detailed view.`);
        }

        function closeModal() {
            document.getElementById('eventModal').style.display = 'none';
        }

        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? '#10b981' : '#3b82f6'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1100;
                animation: slideIn 0.3s ease-out;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Handle form submission
        document.getElementById('eventForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('eventTitle').value,
                department: document.getElementById('eventDepartment').value,
                description: document.getElementById('eventDescription').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                location: document.getElementById('eventLocation').value,
                maxReg: parseInt(document.getElementById('eventMaxReg').value)
            };

            if (editMode) {
                // Update existing event
                showNotification('Event updated successfully!', 'success');
            } else {
                // Create new event
                showNotification('Event created successfully!', 'success');
            }

            closeModal();
        });

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('eventModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Add CSS animation for notifications
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);