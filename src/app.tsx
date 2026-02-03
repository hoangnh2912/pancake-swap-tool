import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import Main from './pages/main'
import { ToastContainer } from './utils/toast'
import { Provider as ZenStackHooksProvider } from './hooks/zenstack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const root = createRoot(document.body)
const fetchInstance = window.fetch.bind(window)
const queryClient = new QueryClient()

const endpoint = 'http://localhost:8080/api/model'

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider>
                <ZenStackHooksProvider
                    value={{
                        endpoint: 'http://localhost:8080/api/model',
                        fetch: fetchInstance,
                    }}
                >
                    <Main />
                    <ToastContainer />
                </ZenStackHooksProvider>
            </ChakraProvider>
        </QueryClientProvider>
    )
}
root.render(App())

export { endpoint, fetchInstance }
