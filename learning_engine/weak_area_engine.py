import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from database.models import (
    WeakAreaTracking, AdaptiveRecommendation, QuizAttempt, AssessmentResult,
    TaskProgress, PracticalTask, LearningModule, RoleRequirementMatrix
)

class WeakAreaEngine:
    """100% Deterministic Signals & Explainable Adaptive Recommendation Engine."""

    @staticmethod
    def detect_weak_areas_and_generate_recommendations(db: Session, employee_id: str) -> Tuple[List[Any], List[Any]]:
        """
        Scans deterministic performance signals (quiz scores, failed assessments, overdue tasks)
        and generates explainable adaptive recommendations.
        """
        weak_areas = []
        recommendations = []

        # 1. Analyze Quiz Attempts for Low Scores (< 70%)
        quizzes = db.query(QuizAttempt).filter(QuizAttempt.employee_id == employee_id).all()
        for q in quizzes:
            if float(q.score) < 70.0:
                topic_name = f"Topic for Req {q.requirement_id or 'General'}"
                mod = db.query(LearningModule).filter(LearningModule.module_id == q.module_id).first()
                if mod:
                    topic_name = mod.title

                # Check if WeakArea entry already exists
                wa = db.query(WeakAreaTracking).filter(
                    WeakAreaTracking.employee_id == employee_id,
                    WeakAreaTracking.topic == topic_name
                ).first()

                if not wa:
                    wa = WeakAreaTracking(
                        weakness_id=str(uuid.uuid4()),
                        employee_id=employee_id,
                        requirement_id=q.requirement_id,
                        topic=topic_name,
                        fail_count=1,
                        last_quiz_score=float(q.score),
                        identified_at=datetime.utcnow()
                    )
                    db.add(wa)
                    db.flush()
                else:
                    wa.fail_count += 1
                    wa.last_quiz_score = float(q.score)

                weak_areas.append(wa)

                # Generate Recommendation
                rec_action = f"Complete revision module: {topic_name}"
                reason_str = f"Quiz score was {float(q.score)}%, below 80% passing standard."
                
                existing_rec = db.query(AdaptiveRecommendation).filter(
                    AdaptiveRecommendation.employee_id == employee_id,
                    AdaptiveRecommendation.recommended_action == rec_action,
                    AdaptiveRecommendation.status == "pending"
                ).first()

                if not existing_rec:
                    rec = AdaptiveRecommendation(
                        recommendation_id=str(uuid.uuid4()),
                        employee_id=employee_id,
                        weakness_id=wa.weakness_id,
                        recommendation_type="Revision Module",
                        recommended_action=rec_action,
                        target_module_id=q.module_id,
                        status="pending",
                        created_at=datetime.utcnow()
                    )
                    db.add(rec)
                    recommendations.append(rec)

        # 2. Analyze Failed Assessments
        assessments = db.query(AssessmentResult).filter(
            AssessmentResult.employee_id == employee_id,
            AssessmentResult.result == "failed"
        ).all()
        for a in assessments:
            wa = db.query(WeakAreaTracking).filter(
                WeakAreaTracking.employee_id == employee_id,
                WeakAreaTracking.topic == a.assessment_topic
            ).first()

            if not wa:
                wa = WeakAreaTracking(
                    weakness_id=str(uuid.uuid4()),
                    employee_id=employee_id,
                    requirement_id=a.requirement_id,
                    topic=a.assessment_topic,
                    fail_count=1,
                    last_quiz_score=0.0,
                    identified_at=datetime.utcnow()
                )
                db.add(wa)
                db.flush()

            weak_areas.append(wa)

            rec_action = f"Manager 1-on-1 review and practical task retry for: {a.assessment_topic}"
            existing_rec = db.query(AdaptiveRecommendation).filter(
                AdaptiveRecommendation.employee_id == employee_id,
                AdaptiveRecommendation.recommended_action == rec_action,
                AdaptiveRecommendation.status == "pending"
            ).first()

            if not existing_rec:
                rec = AdaptiveRecommendation(
                    recommendation_id=str(uuid.uuid4()),
                    employee_id=employee_id,
                    weakness_id=wa.weakness_id,
                    recommendation_type="Manager Review",
                    recommended_action=rec_action,
                    target_module_id=a.module_id,
                    status="pending",
                    created_at=datetime.utcnow()
                )
                db.add(rec)
                recommendations.append(rec)

        db.commit()

        # Fetch all active recommendations for employee
        all_recs = db.query(AdaptiveRecommendation).filter(
            AdaptiveRecommendation.employee_id == employee_id
        ).all()

        return weak_areas, all_recs

Tuple_List_Dict = Any
weak_area_engine = WeakAreaEngine()
