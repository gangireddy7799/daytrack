import React from 'react';
import { UserAuth } from '../context/authContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function NavigationBar() {
    const { googleSignOut, user } = UserAuth();

    const handleGoogleSignOut = async () => {
        try {
            await googleSignOut();
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };

    return (
        <div className='navBar'>
            <h2 className='header'>Track My Day</h2>
            <div className="profile">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/view">View</Link></li>
                    <li><Link to="/compare">Compare</Link></li>
                </ul>
                {user && (
                    <div>
                        <span>{user.displayName}</span> {/* Example usage of `user` */}
                        <FontAwesomeIcon
                            onClick={handleGoogleSignOut}
                            className='UserProfile'
                            icon={faSignOutAlt}
                            title="Sign Out"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
