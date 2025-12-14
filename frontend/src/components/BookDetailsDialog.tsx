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
    /**
     * Controls the visibility of the dialog
     */
    open: boolean;

    /**
     * Callback to close the dialog
     */
    onClose: () => void;

    /**
     *  The book objcet to display details for
     */
    book: ShelfBook | null;
    
    /**
     * The shelf ID the book belongs to
     */
    shelfId: string;

    /**
     *  Callback triggered after a succesful modification --- to refresh parent state
     */
    onUpdate: () => void;
}

/**
 * @returns The dialog window presenting book object's details
 * and allowing progress updates and reviews.
 */
export default function BookDetailsDialog({ open, onClose, book, onUpdate, shelfId }: BookDetailsDialogProps) {
    // --- State: Reading Progress ---
    const [currentPage, setCurrentPage] = useState<number | string>(book?.currentPage || 0);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // --- State: Reviews ---
    const [reviews, setReviews] = useState<Review[]>([]);
    // Initialize myReview with default values for a new review state
    const [myReview, setMyReview] = useState<Partial<Review>>({ rating: 0, comment: '' });
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [error, setError] = useState('');

    /**
     *  Effect: When the book changes, initialize state and fetch reviews
     */
    useEffect(() => {
        if (book) {
            setCurrentPage(book.currentPage);
            fetchReviews();
            fetchMyReview();
        }
    }, [book]);

    /**
     * Fetches all available reviews for the current book
     */
    const fetchReviews = async () => {
        if (!book) return;
        setLoadingReviews(true);
        try {
            const res = await axios.get(`/api/reviews/${book.id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
            // Logging essential for debugging, without disrupting user experience
        } finally {
            setLoadingReviews(false);
        }
    };

    /**
     * Fetches the current user's review for the book, if it exists.
     * Handles the case where no review exists gracefully.
     */
    const fetchMyReview = async () => {
        if (!book) return;
        try {
            const res = await axios.get(`/api/reviews/my/${book.id}`);
            setMyReview(res.data);
        } catch (err) {
            // It's okay if not found (404) --- user hasn't reviewed yet
            // Setting default empty review state
            setMyReview({ rating: 0, comment: '' });
        }
    };

    const handlePagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!book) return;
        const val = e.target.value;

        if (val === '') {
            setCurrentPage('');
            return;
        }

        const numVal = parseInt(val, 10);

        if (!isNaN(numVal) && numVal >= 0) {
            const cappedVal = Math.min(numVal, book.pageCount);
            setCurrentPage(cappedVal);
        }
    };

    /**
     * Handles updating the reading progress of the book.
     */
    const handleUpdateProgress = async () => {
        if (!book) return;
        setLoadingProgress(true);
        try {
            await axios.put(`/api/shelves/${shelfId}/books/${book.id}/progress`, {
                currentPage: Number(currentPage)
            });
            onUpdate(); // refresh parent
        } catch (err: any) {
            console.error(err);
            setError("Failed to update progress");
        } finally {
            setLoadingProgress(false);
        }
    };

    /**
     * Handles submitting or updating the user's review for the book.
     * Validates input and manages submission state.
     */
    const handleSubmitReview = async () => {
        if (!book) return;

        // Validation: Rating is mandatory
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
            // Extract meaningful error message if available
            setError(err.response?.data?.message || err.response?.data || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Guard clause: If no book is provided, render nothing.
    if (!book) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{book.title}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* --- Section: Book Cover --- */}
                    {book.coverUrl && (
                        <Box sx={{ flexShrink: 0 }}>
                            <img src={book.coverUrl} alt={book.title} style={{ width: '150px', borderRadius: '8px' }} />
                        </Box>
                    )}

                    {/* --- Section: Metadata & Progress --- */}
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
                                onChange={handlePagesChange}
                                value={currentPage}
                                onFocus={(event) => event.target.select()}
                                // value is capped at book.pageCount
                                size="small"
                                sx={{ width: '120px' }}
                                InputProps={{ inputProps: { min: 0, max: book.pageCount } }}
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

                {/* --- Section: Reviews --- */}
                <Typography variant="h6" gutterBottom>Reviews</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* -- Sub-section: Current User Review Form -- */}
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

                {/* -- Sub-section: Review List -- */}
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
