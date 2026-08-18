from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from ..models import CollectorLog


def get_collector_logs(
    db: Session,
    limit: int = 50,
    status: str | None = None
):

    query = db.query(CollectorLog)


    if status is not None:

        query = query.filter(
            CollectorLog.status == str(status)
        )


    runs = (
        query
        .order_by(desc(CollectorLog.run_at))
        .limit(limit)
        .all()
    )


    return {

        "limit": limit,

        "status_filter": str(status) if status is not None else None,

        "summary": get_collector_summary(db),

        "runs": [
            {
                "id": run.id,
                "run_at": run.run_at.isoformat() if run.run_at else None,
                "status": run.status,
                "rows_saved": run.rows_saved,
                "message": run.message
            }
            for run in runs
        ]

    }



def get_collector_summary(db: Session):
    """All-time collector health, independent of the current page filter."""

    totals = dict(
        db.query(
            CollectorLog.status,
            func.count(CollectorLog.id)
        )
        .group_by(CollectorLog.status)
        .all()
    )


    runs = sum(totals.values())

    success = totals.get("success", 0)


    rows_saved = (
        db.query(func.sum(CollectorLog.rows_saved)).scalar()
        or 0
    )


    last_run = (
        db.query(func.max(CollectorLog.run_at)).scalar()
    )


    last_success = (
        db.query(func.max(CollectorLog.run_at))
        .filter(CollectorLog.status == "success")
        .scalar()
    )


    return {

        "runs": runs,

        "success": success,

        "errors": runs - success,

        "rows_saved": int(rows_saved),

        "success_rate": round(success / runs * 100, 1) if runs else 0.0,

        "last_run": last_run.isoformat() if last_run else None,

        "last_success": last_success.isoformat() if last_success else None

    }
