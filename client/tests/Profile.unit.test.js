import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../src/pages/profile/Profile';
import * as api from '../src/api/api';

// Mock the API module
jest.mock('../src/api/api', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserRecipes: jest.fn(),
  getSavedRecipes: jest.fn(),
  uploadProfileImage: jest.fn(),
  deleteAccount: jest.fn(),
}));

// Mock auth context
const mockLogout = jest.fn();
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { _id: 'user123', name: 'Test User', email: 'test@example.com', avatar: 'https://example.com/avatar.jpg' },
    setUser: jest.fn(),
    logout: mockLogout
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Profile Component', () => {
  // Sample user data
  const userProfile = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: '2023-01-01T00:00:00.000Z',
    stats: {
      recipesCreated: 10,
      recipesSaved: 5,
      totalComments: 15,
      averageRating: 4.2
    }
  };

  // Sample recipe data
  const userRecipes = [
    {
      _id: 'recipe1',
      title: 'My Delicious Recipe',
      description: 'A recipe I created',
      images: ['https://example.com/recipe1.jpg'],
      prepTime: 15,
      cookTime: 30,
      totalTime: 45,
      difficulty: 'Medium',
      cuisine: 'Italian',
      averageRating: 4.5,
      createdAt: '2023-02-01T00:00:00.000Z',
      author: {
        _id: 'user123',
        name: 'Test User'
      }
    },
    {
      _id: 'recipe2',
      title: 'Another Great Recipe',
      description: 'My second recipe',
      images: ['https://example.com/recipe2.jpg'],
      prepTime: 10,
      cookTime: 20,
      totalTime: 30,
      difficulty: 'Easy',
      cuisine: 'Mexican',
      averageRating: 4.0,
      createdAt: '2023-03-01T00:00:00.000Z',
      author: {
        _id: 'user123',
        name: 'Test User'
      }
    }
  ];

  // Sample saved recipes
  const savedRecipes = [
    {
      _id: 'saved1',
      recipe: {
        _id: 'recipe3',
        title: 'Saved Recipe 1',
        description: 'A recipe I saved',
        images: ['https://example.com/recipe3.jpg'],
        prepTime: 25,
        cookTime: 35,
        totalTime: 60,
        difficulty: 'Hard',
        cuisine: 'French',
        averageRating: 4.8,
        author: {
          _id: 'other-user',
          name: 'Other Chef'
        }
      },
      collection: 'Favorites',
      savedAt: '2023-04-01T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up API mock responses
    api.getUserProfile.mockResolvedValue(userProfile);
    api.getUserRecipes.mockResolvedValue(userRecipes);
    api.getSavedRecipes.mockResolvedValue(savedRecipes);
  });

  it('renders profile with user information', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Initial loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      // User info should be displayed
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();

      // Stats should be displayed
      expect(screen.getByText('10')).toBeInTheDocument(); // recipes created
      expect(screen.getByText('5')).toBeInTheDocument(); // recipes saved
      expect(screen.getByText('15')).toBeInTheDocument(); // total comments
      expect(screen.getByText('4.2')).toBeInTheDocument(); // average rating

      // Should show tabs
      expect(screen.getByText('My Recipes')).toBeInTheDocument();
      expect(screen.getByText('Saved Recipes')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('shows user recipes in My Recipes tab', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      // My Recipes tab should be active by default
      expect(screen.getByText('My Delicious Recipe')).toBeInTheDocument();
      expect(screen.getByText('Another Great Recipe')).toBeInTheDocument();

      // Recipe details should be displayed
      expect(screen.getByText('Italian')).toBeInTheDocument();
      expect(screen.getByText('Mexican')).toBeInTheDocument();
      expect(screen.getAllByText('45 min')[0]).toBeInTheDocument();
      expect(screen.getAllByText('30 min')[0]).toBeInTheDocument();
    });
  });

  it('switches to Saved Recipes tab', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('My Delicious Recipe')).toBeInTheDocument();
    });

    // Click on Saved Recipes tab
    fireEvent.click(screen.getByText('Saved Recipes'));

    await waitFor(() => {
      // Should show saved recipes
      expect(screen.getByText('Saved Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('A recipe I saved')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
      expect(screen.getByText('Other Chef')).toBeInTheDocument();
      expect(screen.getByText('Collection: Favorites')).toBeInTheDocument();
    });
  });

  it('displays saved recipes organized by collections', async () => {
    // Setup multiple collections in the saved recipes
    const multiCollectionSavedRecipes = [
      {
        _id: 'saved1',
        recipe: {
          _id: 'recipe3',
          title: 'Breakfast Recipe',
          description: 'A morning recipe',
          images: ['https://example.com/recipe3.jpg'],
          prepTime: 10,
          cookTime: 15,
          totalTime: 25,
          difficulty: 'Easy',
          cuisine: 'American',
          averageRating: 4.5,
          author: {
            _id: 'other-user1',
            name: 'Breakfast Chef'
          }
        },
        collection: 'Breakfast',
        savedAt: '2023-04-01T00:00:00.000Z'
      },
      {
        _id: 'saved2',
        recipe: {
          _id: 'recipe4',
          title: 'Dinner Recipe',
          description: 'An evening recipe',
          images: ['https://example.com/recipe4.jpg'],
          prepTime: 30,
          cookTime: 45,
          totalTime: 75,
          difficulty: 'Medium',
          cuisine: 'Italian',
          averageRating: 4.2,
          author: {
            _id: 'other-user2',
            name: 'Dinner Chef'
          }
        },
        collection: 'Dinner',
        savedAt: '2023-04-02T00:00:00.000Z'
      },
      {
        _id: 'saved3',
        recipe: {
          _id: 'recipe5',
          title: 'Another Breakfast Item',
          description: 'Another morning recipe',
          images: ['https://example.com/recipe5.jpg'],
          prepTime: 5,
          cookTime: 10,
          totalTime: 15,
          difficulty: 'Easy',
          cuisine: 'French',
          averageRating: 4.0,
          author: {
            _id: 'other-user3',
            name: 'Another Chef'
          }
        },
        collection: 'Breakfast',
        savedAt: '2023-04-03T00:00:00.000Z'
      }
    ];

    // Override the API mock for this test
    api.getSavedRecipes.mockResolvedValue(multiCollectionSavedRecipes);

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for initial load and click on Saved Recipes tab
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Saved Recipes'));

    await waitFor(() => {
      // Check collection headers
      expect(screen.getByText('Breakfast (2)')).toBeInTheDocument();
      expect(screen.getByText('Dinner (1)')).toBeInTheDocument();

      // Check recipes within collections
      expect(screen.getByText('Breakfast Recipe')).toBeInTheDocument();
      expect(screen.getByText('Another Breakfast Item')).toBeInTheDocument();
      expect(screen.getByText('Dinner Recipe')).toBeInTheDocument();

      // Check that recipes are displayed with their proper information
      expect(screen.getByText('American')).toBeInTheDocument();
      expect(screen.getByText('Italian')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
    });
  });

  it('switches to Settings tab and handles profile update', async () => {
    api.updateUserProfile.mockResolvedValueOnce({
      ...userProfile,
      name: 'Updated Name'
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Click on Settings tab
    fireEvent.click(screen.getByText('Settings'));

    // Input fields should be pre-populated with current user data
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveValue('Test User');

    // Update name
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(api.updateUserProfile).toHaveBeenCalledWith({
        name: 'Updated Name',
        email: 'test@example.com'
      });
    });
  });

  it('handles profile image upload', async () => {
    api.uploadProfileImage.mockResolvedValueOnce({
      ...userProfile,
      avatar: 'https://example.com/new-avatar.jpg'
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Settings tab
    fireEvent.click(screen.getByText('Settings'));

    // Mock file upload
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const uploadInput = screen.getByLabelText(/upload new profile picture/i);

    Object.defineProperty(uploadInput, 'files', {
      value: [file],
    });

    fireEvent.change(uploadInput);

    await waitFor(() => {
      expect(api.uploadProfileImage).toHaveBeenCalled();
      // FormData verification is complex, so we just check if the function was called
    });
  });

  it('handles account deletion', async () => {
    api.deleteAccount.mockResolvedValueOnce({ success: true });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Settings tab
    fireEvent.click(screen.getByText('Settings'));

    // Click delete account button
    fireEvent.click(screen.getByText(/delete account/i));

    // Confirm deletion in modal
    const confirmButton = await screen.findByText(/confirm/i);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.deleteAccount).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state when fetching data', () => {
    // Delay API responses
    api.getUserProfile.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(userProfile), 500)));
    api.getUserRecipes.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(userRecipes), 500)));

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Loading state should be shown
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles errors when loading profile data', async () => {
    // Make API calls fail
    api.getUserProfile.mockRejectedValueOnce(new Error('Failed to load profile'));

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
    });
  });
});
