import { Component } from "react";

class Footer extends Component {
  render() {
    return (
        <>
            <footer className="bg-gray-800 text-white p-4 mt-0 w-full">
                <div className="container mx-auto text-center">
                    &copy; {new Date().getFullYear()} OJT Company. All rights reserved.
                </div>
            </footer>
        </>
        );
    }
}

export default Footer;