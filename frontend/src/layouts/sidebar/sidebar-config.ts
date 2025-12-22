// nav-config.ts

import React from "react";
import { FaHome, FaUsers, FaBook, FaChalkboardTeacher } from 'react-icons/fa';
import { FaNetworkWired, FaPersonChalkboard, FaRegFileLines, FaServer } from "react-icons/fa6";

import { BsMegaphoneFill } from 'react-icons/bs';
import { type User } from "../../contexts/AuthContext"; // <-- Adjust path as needed
import { IoMdPaper } from "react-icons/io";

// 1. Derive the UserRole type from the User interface
export type UserRole = User['role']; 

// 2. NavItem Interface (using React.ElementType for compatibility)
export interface NavItem {
    to?: string;
    icon: React.ElementType;
    label: string;
    roles: UserRole[];
    children?: NavItem[];
}

const allPossibleNavItems: NavItem[] = [
    { to: "/users", icon: FaUsers, label: "User Management", roles: ["admin"] },
    
    {
        icon: FaPersonChalkboard,
        label: "Instructor Management",
        roles: ["admin"],
        children: [
            { to: "/instructors", icon: FaChalkboardTeacher, label: "Instructors", roles: ["admin"] },
            { to: "/instructor-applications", icon: FaBook, label: "Applications", roles: ["admin"] }
        ]
    },
    
    { to: "/announcements", icon: BsMegaphoneFill, label: "Announcements", roles: ["admin", "instructor", "learner"] },
    { to: "/courses", icon: FaBook, label: "Courses/Community", roles: ["admin", "instructor", "learner"] },

    { icon: IoMdPaper, label: "History", roles: ["admin"],
        children: [
            { label: "Audit Logs", icon: FaRegFileLines, to: "/logs/audit", roles: ["admin"] },
            { label: "System Logs", icon: FaServer, to: "/logs/system", roles: ["admin"] },
            { label: "Network Logs", icon: FaNetworkWired, to: "/logs/network", roles: ["admin"] }
        ]
    },
];

// 4. Export the Filtering Function
export const getNavItemsForRole = (userRole: UserRole | undefined): NavItem[] => {
    // Return an empty array if the user role is not defined (e.g., logged out)
    if (!userRole) {
        return [];
    }
    
    // a. Determine the specific dashboard link
    let dashboardPath: string;
    switch (userRole) {
        case 'admin':
            dashboardPath = '/admin/dashboard';
            break;
        case 'instructor':
            dashboardPath = '/instructor/dashboard';
            break;
        case 'learner':
            dashboardPath = '/learner/dashboard';
            break;
        default:
            dashboardPath = '/dashboard'; 
            break;
    }

    // b. Create the role-specific Dashboard Item
    const dashboardItem: NavItem = {
        to: dashboardPath,
        icon: FaHome,
        label: "Dashboard",
        roles: ["admin", "instructor", "learner"]
    }

    // c. Recursive filtering logic
    const filterItems = (items: NavItem[]): NavItem[] => {
        return items
            .filter(item => item.roles.includes(userRole))
            .map(item => {
                if (item.children) {
                    const filteredChildren = filterItems(item.children);
                    // Only keep parent item if it has visible children
                    if (filteredChildren.length > 0) {
                        return {
                            ...item,
                            children: filteredChildren
                        };
                    }
                    return null; // Remove parent if no children are visible
                }
                return item;
            })
            .filter((item): item is NavItem => item !== null); // Remove null entries
    };

    // d. Combine the dashboard item with the filtered list
    return [
        dashboardItem, 
        ...filterItems(allPossibleNavItems)
    ];
};