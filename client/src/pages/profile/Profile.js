import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, getUserRecipes, getSavedRecipes } from '../../api/user';
import RecipeGrid from '../../components/RecipeGrid';
import { ERROR_TYPES } from '../../utils/ErrorHandler';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/ToastConfig';
import useErrorHandling from '../../hooks/useErrorHandling';
import './Profile.scss';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('recipes');
    const [recipes, setRecipes] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        avatar: ''
    });

    // Use our custom error handling hook
    const {
        error,
        loading,
        setError,
        executeWithErrorHandling
    } = useErrorHandling();

    // Fetch user profile and recipes
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch profile data
                const profileData = await executeWithErrorHandling(
                    () => getUserProfile(),
                    { errorMessage: 'Unable to load profile data' }
                );

                setProfile(profileData);
                setFormData({
                    name: profileData.name || '',
                    avatar: profileData.avatar || ''
                });

                // Load user's recipes - using Promise.allSettled to continue even if one request fails
                const [recipesResult, savedResult] = await Promise.allSettled([
                    getUserRecipes(),
                    getSavedRecipes()
                ]);

                // Handle recipes result
                if (recipesResult.status === 'fulfilled') {
                    setRecipes(recipesResult.value);
                } else {
                    showWarningToast('Could not load your recipes');
                }

                // Handle saved recipes result
                if (savedResult.status === 'fulfilled') {
                    setSavedRecipes(savedResult.value.map(item => ({
                        ...item.recipe,
                        collection: item.collection,
                        savedAt: item.savedAt
                    })));
                } else {
                    showWarningToast('Could not load your saved recipes');
                }
            } catch (error) {
                // Error is handled by executeWithErrorHandling
                setError({
                    type: error.response?.status === 401 ? ERROR_TYPES.AUTHENTICATION : ERROR_TYPES.UNKNOWN,
                    message: 'Unable to load profile data'
                });
            }
        };

        fetchProfileData();
    }, [executeWithErrorHandling, setError]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle profile update
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form input
        if (!formData.name.trim()) {
            showErrorToast('Name cannot be empty');
            return;
        }

        // URL validation for avatar if provided
        if (formData.avatar && !isValidUrl(formData.avatar)) {
            showErrorToast('Please enter a valid URL for the avatar');
            return;
        }

        try {
            const updatedProfile = await executeWithErrorHandling(
                () => updateUserProfile(formData),
                {
                    onSuccess: () => {
                        setIsEditing(false);
                        showSuccessToast('Your profile has been updated successfully!');
                    }
                }
            );
            setProfile(updatedProfile);
        } catch (error) {
            // Error is handled by executeWithErrorHandling
            // We can add more specific UI feedback here if needed
            if (error.response?.status === 413) {
                showErrorToast('Avatar image is too large. Please use a smaller image.');
            }
        }
    };

    // Helper function to validate URLs
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Switch between editing and viewing mode
    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setFormData({
                name: profile.name || '',
                avatar: profile.avatar || ''
            });
        }
    };

    if (loading && !profile) {
        return (
            <div className="profile-container">
                <div className="profile-loader">
                    <div className="spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-error">
                    <h3>Error Loading Profile</h3>
                    <p>{error.message}</p>
                    {error.type === ERROR_TYPES.AUTHENTICATION && (
                        <p>Please <a href="/auth?mode=login">log in</a> to view your profile.</p>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <img
                        src={profile?.avatar || '/default-avatar.png'}
                        alt="Profile"
                    />
                </div>
                <div className="profile-info">
                    {isEditing ? (
                        <form className="profile-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="avatar">Avatar URL</label>
                                <input
                                    type="text"
                                    id="avatar"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={toggleEdit}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1>{profile?.name}</h1>
                            <p className="profile-email">{profile?.email}</p>
                            <p className="profile-joined">
                                Joined: {new Date(profile?.createdAt).toLocaleDateString()}
                            </p>
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{profile?.stats?.recipesCreated || 0}</span>
                                    <span className="stat-label">Recipes</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{profile?.stats?.recipesSaved || 0}</span>
                                    <span className="stat-label">Saved</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{profile?.stats?.totalComments || 0}</span>
                                    <span className="stat-label">Comments</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{profile?.stats?.averageRating?.toFixed(1) || '-'}</span>
                                    <span className="stat-label">Avg. Rating</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-outline"
                                onClick={toggleEdit}
                            >
                                Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recipes')}
                >
                    My Recipes
                </button>
                <button
                    className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Recipes
                </button>
                <button
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'recipes' && (
                    <>
                        <h2>My Recipes</h2>
                        {recipes.length > 0 ? (
                            <RecipeGrid recipes={recipes} />
                        ) : (
                            <p className="empty-state">You haven't created any recipes yet.</p>
                        )}
                    </>
                )}

                {activeTab === 'saved' && (
                    <>
                        <h2>Saved Recipes</h2>
                        {savedRecipes.length > 0 ? (
                            <div className="saved-recipes">
                                {/* Group recipes by collection */}
                                {Object.entries(savedRecipes.reduce((acc, recipe) => {
                                    const collection = recipe.collection || 'Uncategorized';
                                    if (!acc[collection]) acc[collection] = [];
                                    acc[collection].push(recipe);
                                    return acc;
                                }, {})).map(([collection, recipes]) => (
                                    <div key={collection} className="collection-group">
                                        <h3 className="collection-title">
                                            {collection} ({recipes.length})
                                        </h3>
                                        <RecipeGrid recipes={recipes} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state">You haven't saved any recipes yet.</p>
                        )}
                    </>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h2>Account Settings</h2>
                        <div className="settings-card">
                            <h3>Profile Information</h3>
                            <p>Update your personal information and how your profile appears.</p>
                            <button
                                className="btn btn-primary"
                                onClick={toggleEdit}
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="settings-card">
                            <h3>Email Preferences</h3>
                            <p>Manage your email notifications and subscription preferences.</p>
                            <button className="btn btn-outline">
                                Email Settings
                            </button>
                        </div>

                        <div className="settings-card">
                            <h3>Password</h3>
                            <p>Change your password or reset it if you've forgotten it.</p>
                            <button className="btn btn-outline">
                                Change Password
                            </button>
                        </div>

                        <div className="settings-card danger-zone">
                            <h3>Delete Account</h3>
                            <p>Permanently delete your account and all your data.</p>
                            <button className="btn btn-danger">
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
