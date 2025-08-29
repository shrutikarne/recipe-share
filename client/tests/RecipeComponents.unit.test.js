import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeGrid from '../src/components/RecipeGrid';
import RecipeQuickPreviewModal from '../src/components/RecipeQuickPreviewModal';
import * as api from '../src/api/api';

// Mock the API module
jest.mock('../src/api/api', () => ({
  saveRecipe: jest.fn(),
  unsaveRecipe: jest.fn(),
}));

// Mock auth context
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user123' },
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Recipe Components', () => {
  // Sample recipe data for testing
  const sampleRecipes = [
    {
      _id: 'recipe1',
      title: 'Chocolate Cake',
      description: 'Delicious chocolate cake recipe',
      images: ['https://example.com/cake.jpg'],
      prepTime: 15,
      cookTime: 30,
      totalTime: 45,
      difficulty: 'Easy',
      cuisine: 'Dessert',
      servings: 8,
      ingredients: [
        { name: 'flour', quantity: 2, unit: 'cups' },
        { name: 'sugar', quantity: 1.5, unit: 'cups' },
        { name: 'chocolate', quantity: 200, unit: 'g' },
      ],
      author: {
        _id: 'author1',
        name: 'Chef John',
        avatar: 'https://example.com/avatar.jpg'
      },
      averageRating: 4.5,
      comments: [
        {
          _id: 'comment1',
          user: { _id: 'user1', name: 'User 1' },
          text: 'Great recipe!',
          rating: 5
        }
      ],
      isSaved: false
    },
    {
      _id: 'recipe2',
      title: 'Pasta Carbonara',
      description: 'Classic Italian pasta dish',
      images: ['https://example.com/pasta.jpg'],
      prepTime: 10,
      cookTime: 20,
      totalTime: 30,
      difficulty: 'Medium',
      cuisine: 'Italian',
      servings: 4,
      author: {
        _id: 'author2',
        name: 'Chef Maria',
        avatar: 'https://example.com/avatar2.jpg'
      },
      averageRating: 4.0,
      comments: [],
      isSaved: true
    }
  ];

  describe('RecipeGrid Component', () => {
    it('renders recipe grid with recipes', () => {
      render(
        <BrowserRouter>
          <RecipeGrid recipes={sampleRecipes} />
        </BrowserRouter>
      );

      // Check if recipe titles are rendered
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
      expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();

      // Check if recipe details are rendered
      expect(screen.getByText('Dessert')).toBeInTheDocument();
      expect(screen.getByText('Italian')).toBeInTheDocument();
      expect(screen.getByText('Chef John')).toBeInTheDocument();
      expect(screen.getByText('Chef Maria')).toBeInTheDocument();

      // Check if cooking times are rendered
      expect(screen.getByText('45 min')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
    });

    it('renders empty state when no recipes', () => {
      render(
        <BrowserRouter>
          <RecipeGrid recipes={[]} />
        </BrowserRouter>
      );

      expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
    });

    it('handles recipe click navigation', () => {
      render(
        <BrowserRouter>
          <RecipeGrid recipes={sampleRecipes} />
        </BrowserRouter>
      );

      // Click on a recipe card
      fireEvent.click(screen.getByText('Chocolate Cake'));

      // Expect navigation to recipe details page
      expect(mockNavigate).toHaveBeenCalledWith('/recipe/recipe1');
    });

    it('handles quick preview button click', () => {
      const mockSetSelectedRecipe = jest.fn();
      const mockSetShowModal = jest.fn();

      render(
        <BrowserRouter>
          <RecipeGrid
            recipes={sampleRecipes}
            setSelectedRecipe={mockSetSelectedRecipe}
            setShowModal={mockSetShowModal}
          />
        </BrowserRouter>
      );

      // Find and click quick preview buttons
      const quickViewButtons = screen.getAllByLabelText(/quick view/i);
      fireEvent.click(quickViewButtons[0]);

      expect(mockSetSelectedRecipe).toHaveBeenCalledWith(sampleRecipes[0]);
      expect(mockSetShowModal).toHaveBeenCalledWith(true);
    });

    it('handles save recipe button click', async () => {
      api.saveRecipe.mockResolvedValueOnce({ saved: true });

      render(
        <BrowserRouter>
          <RecipeGrid recipes={sampleRecipes} />
        </BrowserRouter>
      );

      // Find and click the save button on the first recipe (which is not saved)
      const saveButtons = screen.getAllByLabelText(/save recipe/i);
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(api.saveRecipe).toHaveBeenCalledWith('recipe1', { collection: 'Favorites' });
      });
    });

    it('handles unsave recipe button click', async () => {
      api.unsaveRecipe.mockResolvedValueOnce({ saved: false });

      render(
        <BrowserRouter>
          <RecipeGrid recipes={sampleRecipes} />
        </BrowserRouter>
      );

      // Find and click the unsave button on the second recipe (which is saved)
      const saveButtons = screen.getAllByLabelText(/unsave recipe/i);
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(api.unsaveRecipe).toHaveBeenCalledWith('recipe2');
      });
    });
  });

  describe('RecipeQuickPreviewModal Component', () => {
    it('renders recipe details in modal', () => {
      const mockOnClose = jest.fn();

      render(
        <BrowserRouter>
          <RecipeQuickPreviewModal
            show={true}
            onHide={mockOnClose}
            recipe={sampleRecipes[0]}
          />
        </BrowserRouter>
      );

      // Check if recipe details are rendered in the modal
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
      expect(screen.getByText('Delicious chocolate cake recipe')).toBeInTheDocument();
      expect(screen.getByText('Chef John')).toBeInTheDocument();

      // Check if preparation times are rendered
      expect(screen.getByText(/prep time: 15/i)).toBeInTheDocument();
      expect(screen.getByText(/cook time: 30/i)).toBeInTheDocument();
      expect(screen.getByText(/total time: 45/i)).toBeInTheDocument();

      // Check if recipe metadata is rendered
      expect(screen.getByText(/difficulty: easy/i)).toBeInTheDocument();
      expect(screen.getByText(/cuisine: dessert/i)).toBeInTheDocument();
      expect(screen.getByText(/servings: 8/i)).toBeInTheDocument();

      // Check if ingredients are rendered
      expect(screen.getByText(/flour/i)).toBeInTheDocument();
      expect(screen.getByText(/sugar/i)).toBeInTheDocument();
      expect(screen.getByText(/chocolate/i)).toBeInTheDocument();
    });

    it('handles view full recipe button click', () => {
      const mockOnClose = jest.fn();

      render(
        <BrowserRouter>
          <RecipeQuickPreviewModal
            show={true}
            onHide={mockOnClose}
            recipe={sampleRecipes[0]}
          />
        </BrowserRouter>
      );

      // Click on view full recipe button
      fireEvent.click(screen.getByText(/view full recipe/i));

      // Expect navigation to recipe details page
      expect(mockNavigate).toHaveBeenCalledWith('/recipe/recipe1');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles close button click', () => {
      const mockOnClose = jest.fn();

      render(
        <BrowserRouter>
          <RecipeQuickPreviewModal
            show={true}
            onHide={mockOnClose}
            recipe={sampleRecipes[0]}
          />
        </BrowserRouter>
      );

      // Click on close button
      fireEvent.click(screen.getByLabelText(/close/i));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles save recipe button click from modal', async () => {
      api.saveRecipe.mockResolvedValueOnce({ saved: true });

      render(
        <BrowserRouter>
          <RecipeQuickPreviewModal
            show={true}
            onHide={() => { }}
            recipe={sampleRecipes[0]}
          />
        </BrowserRouter>
      );

      // Find and click save button in modal
      const saveButton = screen.getByLabelText(/save recipe/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(api.saveRecipe).toHaveBeenCalledWith('recipe1', { collection: 'Favorites' });
      });
    });

    it('shows rating correctly', () => {
      render(
        <BrowserRouter>
          <RecipeQuickPreviewModal
            show={true}
            onHide={() => { }}
            recipe={sampleRecipes[0]}
          />
        </BrowserRouter>
      );

      // Check if rating is displayed
      expect(screen.getByText(/4.5/i)).toBeInTheDocument();
    });
  });
});
