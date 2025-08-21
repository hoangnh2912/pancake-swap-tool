import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import Main from './pages/main'
import { ToastContainer } from './utils/toast'

const root = createRoot(document.body)

const App = () => {
    return (
        <ChakraProvider>
            <Main />
            <ToastContainer />
        </ChakraProvider>
    )
}
root.render(App())
