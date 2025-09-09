// Events service for main app - connects to Firebase events collection
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

class EventsService {
  constructor() {
    this.collectionName = 'events';
  }

  // Get all active events for the main app
  async getActiveEvents() {
    try {
      console.log('Fetching active events from Firebase...');
      
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const events = [];
      
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({
          id: doc.id,
          ...eventData,
          // Convert Firebase timestamps to JavaScript Date objects
          date: eventData.date,
          createdAt: eventData.createdAt?.toDate(),
          updatedAt: eventData.updatedAt?.toDate()
        });
      });
      
      console.log(`Found ${events.length} active events`);
      return events;
    } catch (error) {
      console.error('Error fetching active events:', error);
      return [];
    }
  }

  // Get all events (for comprehensive display)
  async getAllEvents() {
    try {
      console.log('Fetching all events from Firebase...');
      
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const events = [];
      
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({
          id: doc.id,
          ...eventData,
          // Convert Firebase timestamps
          date: eventData.date,
          createdAt: eventData.createdAt?.toDate(),
          updatedAt: eventData.updatedAt?.toDate()
        });
      });
      
      // Sort by date (newest first for admin-created events)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log(`Found ${events.length} total events`);
      return events;
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  }

  // Convert admin event format to app event format
  formatEventForApp(adminEvent) {
    return {
      id: adminEvent.id,
      title: adminEvent.title,
      date: adminEvent.date,
      location: adminEvent.location,
      category: adminEvent.category || 'Event',
      description: adminEvent.description || 'No description available',
      image: adminEvent.imageUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop',
      status: this.getEventStatus(adminEvent),
      participants: `${adminEvent.maxParticipants || 'Unlimited'} participants`,
      priority: 'medium',
      registrationUrl: adminEvent.registrationUrl,
      organizer: adminEvent.organizer || 'AmaPlayer',
      contactEmail: adminEvent.contactEmail,
      contactPhone: adminEvent.contactPhone,
      requirements: adminEvent.requirements || [],
      prizes: adminEvent.prizes || [],
      tags: adminEvent.tags || []
    };
  }

  // Determine event status based on date, time, and duration
  getEventStatus(event) {
    const now = new Date();
    const eventDate = new Date(event.date);
    const todayDate = new Date();
    
    // Check if event is on the same date (ignoring time)
    const isSameDay = eventDate.toDateString() === todayDate.toDateString();
    
    // If event has start time, use it; otherwise default to 00:00
    const eventStartDate = new Date(event.date);
    if (event.startTime) {
      const [hours, minutes] = event.startTime.split(':').map(Number);
      eventStartDate.setHours(hours, minutes, 0, 0);
    }
    
    // Calculate event end time
    let eventEndDate = new Date(eventStartDate);
    if (event.duration) {
      // Duration in hours (e.g., 2.5 for 2 hours 30 minutes)
      eventEndDate.setHours(eventEndDate.getHours() + Math.floor(event.duration));
      eventEndDate.setMinutes(eventEndDate.getMinutes() + ((event.duration % 1) * 60));
    } else {
      // Default duration of 8 hours for same-day events, 2 hours for others
      const defaultDuration = isSameDay ? 8 : 2;
      eventEndDate.setHours(eventEndDate.getHours() + defaultDuration);
    }
    
    // Determine status with preference for live on same day
    if (eventDate > todayDate) {
      return 'upcoming';
    } else if (isSameDay) {
      // If it's the same day, show as live unless duration has clearly ended
      if (now > eventEndDate) {
        return 'completed';
      } else {
        return 'live';
      }
    } else if (now >= eventStartDate && now <= eventEndDate) {
      return 'live';
    } else {
      return 'completed';
    }
  }

  // Get detailed competition status for display
  getCompetitionStatus(event) {
    const status = this.getEventStatus(event);
    const now = new Date();
    const eventDate = new Date(event.date);
    const isSameDay = eventDate.toDateString() === now.toDateString();
    
    switch (status) {
      case 'upcoming':
        return {
          status: 'upcoming',
          displayText: 'Competition Opens Soon',
          statusClass: 'status-upcoming'
        };
      case 'live':
        if (isSameDay) {
          return {
            status: 'live',
            displayText: 'Competition Ongoing',
            statusClass: 'status-live'
          };
        } else {
          return {
            status: 'live',
            displayText: 'Competition Ongoing',
            statusClass: 'status-live'
          };
        }
      case 'completed':
      default:
        return {
          status: 'completed',
          displayText: 'Competition Ended',
          statusClass: 'status-completed'
        };
    }
  }

  // Get events by status (upcoming, live, completed)
  async getEventsByStatus(status) {
    try {
      const allEvents = await this.getAllEvents();
      const formattedEvents = allEvents.map(event => this.formatEventForApp(event));
      
      return formattedEvents.filter(event => event.status === status);
    } catch (error) {
      console.error(`Error fetching ${status} events:`, error);
      return [];
    }
  }

  // Get upcoming events
  async getUpcomingEvents() {
    return this.getEventsByStatus('upcoming');
  }

  // Get live events
  async getLiveEvents() {
    return this.getEventsByStatus('live');
  }

  // Get completed events
  async getCompletedEvents() {
    return this.getEventsByStatus('completed');
  }
}

export const eventsService = new EventsService();
export default eventsService;