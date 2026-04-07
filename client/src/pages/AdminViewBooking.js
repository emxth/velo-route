import React, { useEffect, useState } from "react";
import api from "../api/axios";

const AdminViewBooking = () => {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [confirmingBookingId, setConfirmingBookingId] = useState(null);

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				setLoading(true);
				setError("");

				const { data } = await api.get("/bookings/");
				const sorted = [...data].sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);
				setBookings(sorted);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to load bookings");
			} finally {
				setLoading(false);
			}
		};

		fetchBookings();
	}, []);

	const formatDate = (date) => {
		if (!date) return "-";
		return new Date(date).toLocaleString();
	};

	const getDayKey = (dateString) => {
		const date = new Date(dateString);
		return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
	};

	const getDayLabel = (dateString) => {
		const date = new Date(dateString);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		const bookingDay = new Date(date);
		bookingDay.setHours(0, 0, 0, 0);

		if (bookingDay.getTime() === today.getTime()) return "Today";
		if (bookingDay.getTime() === tomorrow.getTime()) return "Tomorrow";

		return bookingDay.toLocaleDateString(undefined, {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const filteredBookings = bookings
		.filter((booking) =>
			statusFilter === "ALL" ? true : booking.bookingStatus === statusFilter
		)
		.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));

	const handleConfirmBooking = async (bookingId) => {
		try {
			setError("");
			setConfirmingBookingId(bookingId);
			const { data } = await api.put(`/bookings/${bookingId}/confirm`);

			setBookings((prev) =>
				prev.map((booking) =>
					booking._id === bookingId ? data : booking
				)
			);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to confirm booking");
		} finally {
			setConfirmingBookingId(null);
		}
	};

	const askReason = (actionLabel) => {
		const reason = window.prompt(`Enter reason for ${actionLabel.toLowerCase()}:`);
		if (reason === null) return null;
		if (!reason.trim()) {
			setError("Reason is required.");
			return null;
		}
		return reason.trim();
	};

	const handleAdminReject = async (bookingId) => {
		const reason = askReason("Reject Booking");
		if (!reason) return;

		try {
			setError("");
			const { data } = await api.patch(`/bookings/${bookingId}/admin-reject`, { reason });
			setBookings((prev) =>
				prev.map((booking) => (booking._id === bookingId ? data : booking))
			);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to reject booking");
		}
	};

	const handleAdminCancel = async (bookingId) => {
		const reason = askReason("Cancel Booking");
		if (!reason) return;

		try {
			setError("");
			const { data } = await api.patch(`/bookings/${bookingId}/admin-cancel`, { reason });
			setBookings((prev) =>
				prev.map((booking) => (booking._id === bookingId ? data : booking))
			);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to cancel booking");
		}
	};

	if (loading) {
		return <div className="p-6">Loading bookings...</div>;
	}

	if (error) {
		return (
			<div className="p-6">
				<p className="text-red-600">{error}</p>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-2xl font-bold">All User Bookings</h1>
				<div className="flex items-center gap-2">
					<label htmlFor="statusFilter" className="text-sm font-medium text-neutral-700">
						Filter
					</label>
					<select
						id="statusFilter"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="rounded border border-neutral-300 px-3 py-2 text-sm"
					>
						<option value="ALL">All</option>
						<option value="PENDING">Pending</option>
						<option value="CONFIRMED">Confirmed</option>
						<option value="CANCELLED">Cancelled</option>
					</select>
				</div>
			</div>

			{filteredBookings.length === 0 ? (
				<p className="text-neutral-600">No bookings found.</p>
			) : (
				<div className="overflow-x-auto rounded-lg border bg-white">
					<table className="min-w-full text-sm">
						<thead className="bg-neutral-100 text-neutral-700">
							<tr>
								<th className="px-4 py-3 text-left">User</th>
								<th className="px-4 py-3 text-left">Trip</th>
								<th className="px-4 py-3 text-left">Seats</th>
								<th className="px-4 py-3 text-left">Booking Status</th>
								<th className="px-4 py-3 text-left">Payment Status</th>
								<th className="px-4 py-3 text-left">Booked At</th>
								<th className="px-4 py-3 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredBookings.map((booking, index) => {
								const hasDeparted = new Date(booking.departureTime).getTime() <= Date.now();
								const isPending = booking.bookingStatus === "PENDING";
								const isConfirmed = booking.bookingStatus === "CONFIRMED";
								const canConfirm = !hasDeparted && booking.paymentStatus === "PAID" && isPending;
								const canReject = !hasDeparted && isPending;
								const canCancel = !hasDeparted && isConfirmed;
								const hasAnyAction = canConfirm || canReject || canCancel;
								const currentDayKey = getDayKey(booking.departureTime);
								const previousDayKey =
									index > 0 ? getDayKey(filteredBookings[index - 1].departureTime) : null;
								const showDayTitle = index === 0 || currentDayKey !== previousDayKey;

								return (
								<React.Fragment key={booking._id}>
									{showDayTitle && (
										<tr className="border-t bg-neutral-50">
											<td colSpan={7} className="px-4 py-2 text-xs font-bold tracking-wide text-neutral-700">
												{getDayLabel(booking.departureTime)}
											</td>
										</tr>
									)}
									<tr className="border-t align-top">
										<td className="px-4 py-3">
											<div className="font-medium">{booking.passenger?.name || "Unknown"}</div>
											<div className="text-neutral-500">{booking.passenger?.email || "-"}</div>
										</td>
										<td className="px-4 py-3">
											<div>
												{booking.fromLocation} to {booking.toLocation}
											</div>
											<div className="text-neutral-500">{formatDate(booking.departureTime)}</div>
										</td>
										<td className="px-4 py-3">{booking.seatNumbers?.join(", ") || "-"}</td>
										<td className="px-4 py-3">{booking.bookingStatus}</td>
										<td className="px-4 py-3">{booking.paymentStatus}</td>
										<td className="px-4 py-3">{formatDate(booking.createdAt)}</td>
										<td className="px-4 py-3">
											{hasAnyAction ? (
												<div className="flex flex-wrap gap-2">
													{canConfirm && (
														<button
															type="button"
															onClick={() => handleConfirmBooking(booking._id)}
															disabled={confirmingBookingId === booking._id}
															className="rounded bg-green-600 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
														>
															{confirmingBookingId === booking._id ? "Confirming..." : "Confirm"}
														</button>
													)}
													{canReject && (
														<button
															type="button"
															onClick={() => handleAdminReject(booking._id)}
															className="rounded bg-amber-600 px-3 py-1 text-white"
														>
															Reject
														</button>
													)}
													{canCancel && (
														<button
															type="button"
															onClick={() => handleAdminCancel(booking._id)}
															className="rounded bg-red-600 px-3 py-1 text-white"
														>
															Cancel
														</button>
													)}
												</div>
											) : (
												<span className="text-neutral-400">-</span>
											)}
										</td>
									</tr>
								</React.Fragment>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default AdminViewBooking;
