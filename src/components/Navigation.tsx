"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Search from './Search';
import { Button } from '@/components/ui/button';

const Navigation: React.FC = () => {
  const [user] = useAuthState(auth);
  const pathname = usePathname();
  const [isNominatedLeader, setIsNominatedLeader] = useState(false);

  useEffect(() => {
    const checkNomineeStatus = async () => {
      if (user) {
        const nomineeQuery = query(collection(db, 'nominees'), where('email', '==', user.email));
        const nomineeSnapshot = await getDocs(nomineeQuery);
        setIsNominatedLeader(!nomineeSnapshot.empty);
      }
    };

    checkNomineeStatus();
  }, [user]);

  const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className={`mx-2 ${isActive ? 'font-bold' : ''}`}>
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold mr-4">
            Trusted People
          </Link>
          {user && <NavLink href="/vote">Vote</NavLink>}
          {user && <NavLink href="/nominate">Nominate</NavLink>}
          {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          {isNominatedLeader && <NavLink href="/transfer-votes">Transfer Votes</NavLink>}
          <NavLink href="/leaderboard">Leaderboard</NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <Search />
          </div>
          {user ? (
            <Button onClick={() => auth.signOut()}>Sign Out</Button>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;