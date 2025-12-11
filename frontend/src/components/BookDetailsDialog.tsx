import { useState, useEffect } from 'react';
import axios from '../api/axios';
import type { ShelfBook, Review } from '../types/book';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    Rating,
    Divider,
    Avatar,
    Stack,
    CircularProgress,
    Alert
} from '@mui/material';

interface BookDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    book: ShelfBook | null;
    shelfId: string;
    onUpdate: () => void; // Refresh shelf data
}

export default function BookDetailsDialog({ open, onClose, book, onUpdate, shelfId }: BookDetailsDialogProps) {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // Review State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReview, setMyReview] = useState<Partial<Review>>({ rating: 0, comment: '' });
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (book) {
            setCurrentPage(book.currentPage);
            fetchReviews();
            fetchMyReview();
        }
    }, [book]);

    const fetchReviews = async () => {
        if (!book) return;
        setLoadingReviews(true);
        try {
            const res = await axios.get(`/api/reviews/${book.id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchMyReview = async () => {
        if (!book) return;
        try {
            const res = await axios.get(`/api/reviews/my/${book.id}`);
            setMyReview(res.data);
        } catch (err) {
            // It's okay if not found (404), user hasn't reviewed yet
            setMyReview({ rating: 0, comment: '' });
        }
    };

    const handleUpdateProgress = async () => {
        if (!book) return;
        setLoadingProgress(true);
        try {
            await axios.put(`/api/shelves/${shelfId}/books/${book.id}/progress`, {
                currentPage: Number(currentPage)
            });
            onUpdate(); // refresh parent
            // alert("Progress updated!");
        } catch (err: any) {
            console.error(err);
            setError("Failed to update progress");
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!book) return;
        if (!myReview.rating || myReview.rating === 0) {
            setError("Please select a rating.");
            return;
        }
        setSubmittingReview(true);
        setError('');
        try {
            await axios.post('/api/reviews', {
                bookId: book.id,
                rating: myReview.rating,
                comment: myReview.comment
            });
            fetchReviews(); // Refresh review list
            fetchMyReview(); // Refresh my review
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (!book) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{book.title}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Cover */}
                    {book.coverUrl && (
                        <Box sx={{ flexShrink: 0 }}>
                            <img src={book.coverUrl} alt={book.title} style={{ width: '150px', borderRadius: '8px' }} />
                        </Box>
                    )}

                    {/* Metadata */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                            By {book.authors.join(', ')}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                            {book.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Progress Section */}
                        <Typography variant="h6" gutterBottom>Reading Progress</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                type="number"
                                label="Pages Read"
                                value={currentPage}
                                onChange={(e) => setCurrentPage(Math.min(Number(e.target.value), book.pageCount))}
                                inputProps={{ min: 0, max: book.pageCount }}
                                size="small"
                                sx={{ width: '120px' }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                / {book.pageCount} pages
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleUpdateProgress}
                                disabled={loadingProgress}
                            >
                                {loadingProgress ? <CircularProgress size={24} /> : "Update"}
                            </Button>
                        </Stack>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Reviews Section */}
                <Typography variant="h6" gutterBottom>Reviews</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* My Review Form */}
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Write a Review</Typography>
                    <Rating
                        value={myReview.rating}
                        onChange={(_, val) => setMyReview(prev => ({ ...prev, rating: val || 0 }))}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="What did you think?"
                        value={myReview.comment || ''}
                        onChange={(e) => setMyReview(prev => ({ ...prev, comment: e.target.value }))}
                        sx={{ mt: 2, mb: 2, bgcolor: 'background.paper' }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                    >
                        {submittingReview ? "Saving..." : "Save Review"}
                    </Button>
                </Box>

                {/* List of Reviews */}
                {loadingReviews ? (
                    <CircularProgress />
                ) : (
                    <Stack spacing={2}>
                        {reviews.length === 0 && <Typography color="text.secondary">No reviews yet.</Typography>}
                        {reviews.map((r) => (
                            <Box key={r.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                    <Avatar
                                        src={r.userAvatarUrl}
                                        alt={r.userName}
                                        sx={{ width: 32, height: 32 }}
                                    >
                                        {r.userName[0]?.toUpperCase()}
                                    </Avatar>
                                    <Typography variant="subtitle2">{r.userName}</Typography>
                                    <Rating value={r.rating} readOnly size="small" />
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2">{r.comment}</Typography>
                            </Box>
                        ))}
                    </Stack>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
