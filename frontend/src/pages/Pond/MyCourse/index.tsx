import React, { useState, useEffect } from "react";
import HeaderComponent from "../../../components/header";
//import { Link } from "react-router-dom";
import Modal from "./CreateReview/Pop_Up";
import { GetReviewById, GetPaymentByIdUser } from "../../../services/https";
import { message, Card, Row } from "antd";
import { PaymentsReviewInterface } from "../../../interfaces/IPayment";
import "./popup.css";

const Review: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [hasReviewed, setHasReviewed] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [payments, setPayments] = useState<PaymentsReviewInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [uid, setUid] = useState<number>(
    Number(localStorage.getItem("id")) || 0
  );

  useEffect(() => {
    setUid(Number(localStorage.getItem("id")));
    const fetchAllReviewsAndPayments = async () => {
      const reviewStatus: { [key: number]: boolean } = {};

      const paymentsData = await GetPaymentByIdUser(uid);

      if (!paymentsData || paymentsData.length === 0) return;

      for (const payment of paymentsData) {
        const reviews = await GetReviewById(payment.CourseID);
        const userReview = reviews.find((review) => review.UserID === uid);
        reviewStatus[payment.CourseID!] = !!userReview;
      }

      setHasReviewed(reviewStatus);
      setPayments(paymentsData);
    };

    fetchAllReviewsAndPayments();
  }, []);

  const openModal = (id: number) => {
    if (hasReviewed[id]) {
      messageApi.warning("ท่านได้ทำการรีวิวหลักสูตรนี้แล้ว");
      return;
    }
    setCurrentCourseId(id);
    setIsOpen(true);
  };

  const handleReviewSubmit = (courseId: number) => {
    setHasReviewed((prevState) => ({
      ...prevState,
      [courseId]: true,
    }));
  };

  return (
    <div>
      {contextHolder}
      <HeaderComponent />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="header-mycourse">MyCourse</div>
      <div className="review-layer">
        {payments.map((payment) => (
          <Card key={payment.CourseID} className="product-review">
            <img
              src={payment.Course.ProfilePicture}
              alt={`${payment.Course.Title} Course`}
            />
            <p className="text-product">
              <strong>Name : {payment.Course.Title}</strong>
              <br />
              Tutor ID : {payment.Course.TutorProfileID}
              <div className="button-open">
                {hasReviewed[payment.CourseID!] ? (
                  <button
                    className="button-open-model"
                    onClick={() =>
                      messageApi.warning(
                        "ท่านได้ทำการรีวิวหลักสูตรนี้แล้ว"
                      )
                    }
                  >
                    Already Reviewed
                  </button>
                ) : (
                  <button
                    className="button-open-model"
                    onClick={() => openModal(payment.CourseID!)}
                  >
                    Review Course
                  </button>
                )}
                {currentCourseId === payment.CourseID && (
                  <Modal
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    CourseID={currentCourseId}
                    UserID={uid}
                    onReviewSubmit={handleReviewSubmit}
                  />
                )}
              </div>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Review;
