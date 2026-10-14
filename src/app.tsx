import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import { createRoot } from 'react-dom/client'
import { Provider as ZenStackProvider } from './hooks/zenstack'
import TabManager from './pages/tab-manager'
import { configureZenStack } from './utils/zenstack-function'

const serverPort = new URLSearchParams(window.location.search).get('serverPort') || '8791'
const endpoint = `http://localhost:${serverPort}/api/model`
const fetchInstance = window.fetch.bind(window)
configureZenStack(endpoint, fetchInstance)

const queryClient = new QueryClient()
const root = createRoot(document.body)

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ZenStackProvider value={{ endpoint, fetch: fetchInstance }}>
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                <ChakraProvider>
                    <TabManager />
                </ChakraProvider>
            </ConfigProvider>
        </ZenStackProvider>
    </QueryClientProvider>
)

root.render(App())
