import { ChakraProvider } from '@chakra-ui/react'
import { ConfigProvider, theme } from 'antd'
import { createRoot } from 'react-dom/client'
import Main from './pages/main'

const root = createRoot(document.body)

const App = () => (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <ChakraProvider>
            <Main />
        </ChakraProvider>
    </ConfigProvider>
)

root.render(App())
