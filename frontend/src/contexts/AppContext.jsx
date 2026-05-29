import { createContext, useContext, useState } from "react"

export const createdContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    return (
        <createdContext.Provider value={{ user, setUser }}>
            {children}
        </createdContext.Provider>
    )
}

const useAppContext = () => {
    const context = useContext(createdContext)

    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }

    return context
}

export default useAppContext