import api from "./axios";

// Define the data structure for the primary dashboard metrics
export interface DashboardAnalytics {
    totalUsers: number;
    totalInstructors: number;
    totalLearners: number;
    
    totalAnnouncements: number;
    recentAnnouncements: number; 

    wsConnectedClients: number;       
    authFailureRate: number;         
    apiErrorRate: number;            
    messagesBroadcasted: number;      
    // userGrowthData: any;
}

// Function to fetch all metrics required for the main dashboard cards
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
        // This endpoint will be /api/dashboard/analytics or similar
        const response = await api.get('/users/analytics'); 
        
        // Assuming the backend returns the data structure directly
        const data = response.data;
        
        // Validate and normalize the incoming data structure
        return {
            totalUsers: data.totalUsers || 0,
            totalInstructors: data.totalInstructors || 0,
            totalLearners: data.totalLearners || 0,
            totalAnnouncements: data.totalAnnouncements || 0,
            recentAnnouncements: data.recentAnnouncements || 0,
            wsConnectedClients: data.wsConnectedClients || 0,
            authFailureRate: data.authFailureRate || 0,           
            apiErrorRate: data.apiErrorRate || 0,              
            messagesBroadcasted: data.messagesBroadcasted || 0,       
        };
    } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        // Return default/zero values on failure
        return {
            totalUsers: 0,
            totalInstructors: 0,
            totalLearners: 0,
            totalAnnouncements: 0,
            recentAnnouncements: 0,
            wsConnectedClients: 0,
            authFailureRate: 0,           
            apiErrorRate: 0,              
            messagesBroadcasted: 0,   
        };
    }
}