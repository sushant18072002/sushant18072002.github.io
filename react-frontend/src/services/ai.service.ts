import { apiService } from './api';
import { AITripRequest, AITripResponse, Itinerary } from '@/types/api.types';

class AIService {
  async generateTrip(tripRequest: AITripRequest) {
    return apiService.post<AITripResponse>('/ai/generate-trip', tripRequest);
  }

  async getAITemplates() {
    return apiService.get<any[]>('/ai/templates');
  }

  async chatWithAI(message: string, context?: any) {
    return apiService.post<{
      response: string;
      suggestions?: string[];
      followUp?: string[];
    }>('/ai/chat', { message, context });
  }

  async refineItinerary(itineraryId: string, refinements: Array<{
    type: string;
    description?: string;
    newBudget?: number;
    newDuration?: number;
    addInterests?: string[];
    removeInterests?: string[];
  }>) {
    return apiService.post<Itinerary>('/ai/refine-itinerary', {
      itineraryId,
      refinements,
    });
  }

  // AI conversation flow helpers
  async startAIConversation(initialRequest: string) {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = {
      id: conversationId,
      messages: [
        {
          role: 'user',
          content: initialRequest,
          timestamp: new Date().toISOString(),
        }
      ],
      context: {},
      step: 'initial',
    };

    localStorage.setItem(`ai_conversation_${conversationId}`, JSON.stringify(conversation));
    return conversation;
  }

  async continueAIConversation(conversationId: string, message: string) {
    const saved = localStorage.getItem(`ai_conversation_${conversationId}`);
    if (!saved) throw new Error('Conversation not found');

    const conversation = JSON.parse(saved);
    
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Simulate AI response based on conversation context
    const aiResponse = await this.chatWithAI(message, conversation.context);
    
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.data?.response || 'I understand. Let me help you with that.',
      timestamp: new Date().toISOString(),
      suggestions: aiResponse.data?.suggestions,
      followUp: aiResponse.data?.followUp,
    });

    localStorage.setItem(`ai_conversation_${conversationId}`, JSON.stringify(conversation));
    return conversation;
  }

  async getAIConversation(conversationId: string) {
    const saved = localStorage.getItem(`ai_conversation_${conversationId}`);
    return saved ? JSON.parse(saved) : null;
  }

  async clearAIConversation(conversationId: string) {
    localStorage.removeItem(`ai_conversation_${conversationId}`);
  }

  // AI trip generation helpers
  async generateTripFromDescription(description: string, additionalParams?: Partial<AITripRequest>) {
    const baseRequest: AITripRequest = {
      duration: 7,
      budget: 2000,
      travelers: 2,
      interests: [],
      travelStyle: 'balanced',
      description,
      ...additionalParams,
    };

    return this.generateTrip(baseRequest);
  }

  async generateSimilarTrip(baseItineraryId: string, modifications?: {
    budget?: number;
    duration?: number;
    travelers?: number;
    interests?: string[];
  }) {
    return apiService.post<AITripResponse>('/ai/generate-similar', {
      baseItineraryId,
      modifications,
    });
  }

  // AI recommendations
  async getPersonalizedRecommendations(userPreferences?: {
    previousDestinations?: string[];
    interests?: string[];
    budget?: number;
    travelStyle?: string;
  }) {
    return apiService.post<any[]>('/ai/recommendations', userPreferences);
  }

  async getDestinationInsights(destination: string) {
    return apiService.get<{
      bestTimeToVisit: string;
      weather: any;
      localTips: string[];
      budgetEstimate: any;
      popularActivities: string[];
    }>(`/ai/destination-insights/${destination}`);
  }
}

export const aiService = new AIService();