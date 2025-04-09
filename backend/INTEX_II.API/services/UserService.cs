// File: /backend/CineNiche.API/Services/UserService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CineNiche.API.Data;
using CineNiche.API.Models;

namespace CineNiche.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserDbContext _context;
        private readonly ILogger<UserService> _logger;

        

        public UserService(UserDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<User> GetUserByIdAsync(Guid id)
        {
            try
            {
                return await _context.Users.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by ID {UserId}", id);
                return null;
            }
        }

        public async Task<User> GetUserByExternalIdAsync(string externalId)
        {
            try
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.ExternalAuthId == externalId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by external ID {ExternalId}", externalId);
                return null;
            }
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            try
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by email {Email}", email);
                return null;
            }
        }

        public async Task<User> CreateUserAsync(User user)
        {
            try
            {
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                {
                    throw new InvalidOperationException($"User with email {user.Email} already exists");
                }

                if (await _context.Users.AnyAsync(u => u.ExternalAuthId == user.ExternalAuthId))
                {
                    throw new InvalidOperationException($"User with external ID {user.ExternalAuthId} already exists");
                }

                // Set default values if not provided
                if (user.Id == Guid.Empty)
                {
                    user.Id = Guid.NewGuid();
                }

                if (user.CreatedAt == default)
                {
                    user.CreatedAt = DateTime.UtcNow;
                }

                if (string.IsNullOrEmpty(user.Role))
                {
                    user.Role = "User"; // Default role
                }

                // Add the user to the database
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Email}", user.Email);
                throw; // Re-throw so the caller can handle the error
            }
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            try
            {
                // Find the user
                var existingUser = await _context.Users.FindAsync(user.Id);
                if (existingUser == null)
                {
                    throw new KeyNotFoundException($"User with ID {user.Id} not found");
                }

                // Update user properties
                existingUser.FirstName = user.FirstName;
                existingUser.LastName = user.LastName;
                existingUser.ProfileImageUrl = user.ProfileImageUrl;
                existingUser.IsActive = user.IsActive;
                existingUser.LastLogin = user.LastLogin;
                
                // Save changes
                _context.Users.Update(existingUser);
                await _context.SaveChangesAsync();

                return existingUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", user.Id);
                throw; // Re-throw so the caller can handle the error
            }
        }

        public async Task<bool> AssignRoleAsync(Guid userId, string role)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return false;
                }

                // Validate the role (you could check against a list of valid roles)
                if (role != "User" && role != "Admin")
                {
                    throw new ArgumentException($"Invalid role: {role}");
                }

                user.Role = role;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role {Role} to user {UserId}", role, userId);
                return false;
            }
        }

        public async Task<List<User>> GetUsersByRoleAsync(string role)
        {
            try
            {
                return await _context.Users
                    .Where(u => u.Role == role)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users by role {Role}", role);
                return new List<User>();
            }
        }

        public async Task<bool> ActivateUserAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return false;
                }

                user.IsActive = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> DeactivateUserAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return false;
                }

                user.IsActive = false;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UpdateLastLoginAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return false;
                }

                user.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating last login for user {UserId}", userId);
                return false;
            }
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            try
            {
                return await _context.Users.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                return new List<User>();
            }
        }
    }
}