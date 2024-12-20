"use client";

import { useEffect, useState } from "react";


export default function ScrollState() {

    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {        

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 0) {
                document.body.classList.add("scroll");
            } else {                
                document.body.classList.remove("scroll");
            }

            if (currentScrollY < lastScrollY) {
                document.body.classList.add("scroll-up");
                document.body.classList.remove("scroll-down");
            } else if (currentScrollY > lastScrollY) {
                document.body.classList.add("scroll-down");
                document.body.classList.remove("scroll-up");
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);


        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    
    }, [lastScrollY]);

    return null;
}