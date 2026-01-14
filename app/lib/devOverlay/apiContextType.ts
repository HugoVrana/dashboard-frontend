export type APIContextType = {
    dashboardApiIsLocal : boolean
    dashboardAuthApiIsLocal : boolean
    dashboardApiUrl: string
    dashboardToggleMode: () => void
    dashboardAuthApiUrl: string
    dashboardAuthToggleMode: () => void
    isReady: boolean
}