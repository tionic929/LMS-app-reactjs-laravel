
const Footer: React.FC = () => {
    return (
        <>
            <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-30">
                <div className="container mx-auto text-center">
                    &copy; {new Date().getFullYear()} OJT Company. All rights reserved.
                </div>
            </footer>
        </>
    )
}

export default Footer;