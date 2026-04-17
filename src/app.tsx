import { ChakraProvider, Box, Text } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import Main from './pages/main'
import { ToastContainer } from './utils/toast'
import { Provider as ZenStackHooksProvider } from './hooks/zenstack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const root = createRoot(document.body)
const fetchInstance = window.fetch.bind(window)
const queryClient = new QueryClient()

const endpoint = 'http://localhost:8080/api/model'
const APP_VERSION: string = (window as any).electron?.appVersion ?? ''

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
                    <Box pb="28px">
                        <Main />
                    </Box>
                    <ToastContainer />
                    <Box
                        position="fixed"
                        bottom={0}
                        left={0}
                        right={0}
                        h="28px"
                        bg="gray.800"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        zIndex={9999}
                    >
                        <Text fontSize="xs" color="gray.400" letterSpacing="wide">
                            scan-transfer &nbsp;·&nbsp; v{APP_VERSION}
                        </Text>
                    </Box>
                </ZenStackHooksProvider>
            </ChakraProvider>
        </QueryClientProvider>
    )
}
root.render(App())

export { endpoint, fetchInstance }
