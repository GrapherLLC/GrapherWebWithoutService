"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Calendar,
  DollarSign,
  Star,
  Users,
  Globe,
  Clock,
  Edit2,
  Package,
  CalendarRange,
} from "lucide-react";
import type { ProfessionalProfile } from "@/types/professional";

export default function ProfessionalDashboard() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("No user found");
          return;
        }

        const docRef = doc(db, "profilesProfessionals", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as ProfessionalProfile;
          console.log("Loaded Profile:", profileData); // Log the profile data
          setProfile(profileData);

          // Extract portfolio photos from profile data
          const photos = Array.isArray(profileData.portfolio?.files)
            ? profileData.portfolio.files.map((file) => file.url)
            : Object.values(profileData.portfolio?.files || {}).map(
                (file) => (file as { url: string }).url,
              );
          setPortfolioPhotos(photos);
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-dark-text-secondary">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error || "Profile not found"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Switch To Client Button */}
      <div className="flex justify-center mb-8">
        <Link
          href="/dashboard/client/"
          className="px-8 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg hover:bg-primary-600 transition-colors"
        >
          Switch To Client
        </Link>
      </div>

      {/* Profile Overview Section */}
      <div className="bg-dark-card rounded-lg overflow-hidden">
        <div className="relative h-48 w-full">
          {profile.coverImage ? (
            <Image
              src={profile.coverImage.url}
              alt="Profile cover"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-dark-input" />
          )}
          <Link
            href="/pro-signup/create-profile/basic-info?from=edit"
            className="absolute top-4 right-4 p-2 bg-dark-bg/80 rounded-full hover:bg-dark-bg transition-colors"
          >
            <Edit2 className="w-5 h-5 text-dark-text-primary" />
          </Link>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative -mt-16 w-32 h-32">
                {auth.currentUser?.photoURL ? (
                  <Image
                    src={auth.currentUser.photoURL}
                    alt={auth.currentUser.displayName || "Profile"}
                    fill
                    className="rounded-lg object-cover border-4 border-dark-card"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-input rounded-lg border-4 border-dark-card" />
                )}
              </div>
              <div className="pt-4">
                <h1 className="text-2xl font-bold text-dark-text-primary">
                  {auth.currentUser?.displayName}
                </h1>
                <p className="text-dark-text-secondary mt-1">{profile.bio}</p>

                {/* Services */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-dark-text-primary mb-2">
                    Services
                  </h3>
                  {profile.services &&
                  Object.values(profile.services).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(profile.services)
                        ? profile.services
                        : Object.values(
                            profile.services as Record<string, string>,
                          )
                      )
                        .slice(0, 4)
                        .map((service, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-dark-input text-dark-text-secondary text-sm rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 mt-2">
                      No services added. Consider updating your profile.
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-dark-text-primary mb-2">
                    Skills
                  </h3>
                  {profile.skills &&
                  Object.values(profile.skills).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(profile.skills)
                        ? profile.skills
                        : Object.values(
                            profile.skills as Record<string, string>,
                          )
                      ).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-dark-input text-dark-text-secondary text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 mt-2">
                      No skills added. Consider updating your profile.
                    </p>
                  )}
                </div>

                {/* Equipment */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-dark-text-primary mb-2">
                    Equipment
                  </h3>
                  {profile.equipment &&
                  Object.values(profile.equipment).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(profile.equipment)
                        ? profile.equipment
                        : Object.values(
                            profile.equipment as Record<string, string>,
                          )
                      ).map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-dark-input text-dark-text-secondary text-sm rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 mt-2">
                      No equipment added. Consider updating your profile.
                    </p>
                  )}
                </div>

                {/* Locations Section */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-dark-text-primary mb-2">
                    Locations
                  </h3>
                  {profile.availability?.locations &&
                  Object.values(profile.availability.locations).length > 0 ? (
                    <ul className="list-disc list-inside text-dark-text-secondary">
                      {Object.values(profile.availability.locations).map(
                        (loc, index) => (
                          <li key={index}>{`${loc.city}, ${loc.country}`}</li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-red-500 mt-2">
                      No locations added. Consider updating your profile.
                    </p>
                  )}
                </div>

                {/* Remote Work and Response Time */}
                {profile.availability && (
                  <div className="mt-4 space-y-2">
                    {profile.availability.remoteWork && (
                      <div className="flex items-center text-dark-text-secondary">
                        <Globe className="w-4 h-4 mr-2" />
                        <span>Available for remote work</span>
                      </div>
                    )}
                    <div className="flex items-center text-dark-text-secondary">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        Responds within {profile.availability.responseTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 justify-center">
            <div className="bg-dark-input rounded-lg p-4 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <DollarSign className="w-5 h-5 text-primary-500" />
                <span className="text-2xl font-bold text-dark-text-primary">
                  ${profile.usageStats.moneyEarned.toLocaleString()}
                </span>
              </div>
              <p className="text-dark-text-secondary text-sm mt-2">
                Total Earnings
              </p>
            </div>
            <div className="bg-dark-input rounded-lg p-4 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-primary-500" />
                <span className="text-2xl font-bold text-dark-text-primary">
                  {profile.usageStats.completedOrders}
                </span>
              </div>
              <p className="text-dark-text-secondary text-sm mt-2">
                Completed Jobs
              </p>
            </div>
            <div className="bg-dark-input rounded-lg p-4 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <Star className="w-5 h-5 text-primary-500" />
                <span className="text-2xl font-bold text-dark-text-primary">
                  {profile.usageStats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-dark-text-secondary text-sm mt-2">
                Average Rating
              </p>
            </div>
            <div className="bg-dark-input rounded-lg p-4 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <Calendar className="w-5 h-5 text-primary-500" />
                <span
                  className={`text-2xl font-bold ${
                    profile.ranking.level === "Bronze"
                      ? "text-yellow-700"
                      : profile.ranking.level === "Silver"
                        ? "text-gray-400"
                        : profile.ranking.level === "Gold"
                          ? "text-yellow-500"
                          : profile.ranking.level === "Platinum"
                            ? "text-neutral-300"
                            : profile.ranking.level === "Diamond"
                              ? "text-blue-400"
                              : "text-dark-text-primary"
                  }`}
                >
                  {profile.ranking.level}
                </span>
              </div>
              <p className="text-dark-text-secondary text-sm mt-2">Ranking</p>
            </div>

            {/* Experience Section */}
            <div className="bg-dark-input rounded-lg p-4 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <CalendarRange className="w-5 h-5 text-primary-500" />
                <span className="text-2xl font-bold text-dark-text-primary">
                  {profile.experience.years}
                </span>
              </div>
              <p className="text-dark-text-secondary text-sm mt-2">
                Years of Experience
              </p>
            </div>
            <div className="bg-dark-input rounded-lg p-4 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <Package className="w-5 h-5 text-primary-500" />
                <span className="text-2xl font-bold text-dark-text-primary">
                  {profile.experience.completedProjects}
                </span>
              </div>
              <p className="text-dark-text-secondary text-sm mt-2">
                Completed Projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Photos Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">
          Portfolio
        </h2>
        {portfolioPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {portfolioPhotos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-dark-input"
              >
                <Image
                  src={photo}
                  alt={`Portfolio ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-red-500 mt-2">
            No portfolio items added. Consider updating your profile.
          </p>
        )}
      </div>

      {/* External Portfolio Links Section */}
      {profile.portfolio?.externalLinks && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-dark-text-primary mb-4">
            External Portfolio Links
          </h2>
          <ul className="list-disc list-inside text-dark-text-secondary space-y-2">
            {Object.values(profile.portfolio.externalLinks).map(
              (link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                  >
                    {link.platform}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
