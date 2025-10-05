import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { Provider as ZenStackHooksProvider } from './hooks/zenstack'
import Main from './pages/main'
import { ToastContainer } from './utils/toast'

const root = createRoot(document.body)
const queryClient = new QueryClient()

const fetchInstance = window.fetch.bind(window)

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ZenStackHooksProvider
                value={{
                    endpoint: 'http://localhost:3030/api/model',
                    fetch: fetchInstance,
                }}
            >
                <ChakraProvider>
                    <Main />
                    <ToastContainer />
                </ChakraProvider>
            </ZenStackHooksProvider>
        </QueryClientProvider>
    )
}
root.render(App())
