"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function ScrollState() {

    const pathname = usePathname();
    const [lastScrollY, setLastScrollY] = useState(0);

    // Add class to body when on home page
    useEffect(() => {
        if (pathname === "/") {
            document.body.classList.add("home");
            document.body.classList.remove("not-home");
        } else {
            document.body.classList.add("not-home");
            document.body.classList.remove("home");
        }
    }, [pathname]);

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