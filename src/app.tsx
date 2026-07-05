import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import { createRoot } from 'react-dom/client'
import { Provider as ZenStackProvider } from './hooks/zenstack'
import TabManager from './pages/tab-manager'

export const endpoint = 'http://localhost:8080/api/model'
export const fetchInstance = window.fetch.bind(window)

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
