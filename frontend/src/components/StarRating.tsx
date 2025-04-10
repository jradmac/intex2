import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = {
  showId: string;
};

const StarRating: React.FC<Props> = ({ showId }) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);

  const token = localStorage.getItem('authToken');

  // Fetch user's rating for this movie
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:5000/api/rating/user/${showId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRating(data.rating);
        }
      } catch (err) {
        console.error('Error fetching user rating:', err);
      }
    };

    fetchUserRating();
  }, [showId, token]);

  // Send rating to backend
  const submitRating = async (newRating: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/rating/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ showId, rating: newRating }),
      });

      if (response.ok) {
        setRating(newRating);
      } else {
        console.error('Failed to submit rating');
      }
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  return (
    <Container>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          $filled={star <= (hover || rating)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => submitRating(star)}
        >
          ★
        </Star>
      ))}
      <RatingLabel>{rating ? `You rated this ${rating}/5` : 'Rate this movie'}</RatingLabel>
    </Container>
  );
};

export default StarRating;

// ================= STYLED COMPONENTS =================

const Container = styled.div`
  margin-top: 30px;
`;

const Star = styled.span<{ $filled: boolean }>`
  font-size: 2rem;
  color: ${({ $filled }) => ($filled ? '#FFD700' : '#444')};
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #FFD700;
  }
`;

const RatingLabel = styled.div`
  margin-top: 8px;
  font-size: 0.9rem;
  color: #bbb;
`;
