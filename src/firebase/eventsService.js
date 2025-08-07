// Events service for main app - connects to Firebase events collection
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

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

  // Determine event status based on date and isActive
  getEventStatus(event) {
    if (!event.isActive) return 'cancelled';
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'completed';
    if (daysDiff === 0) return 'live';
    return 'upcoming';
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