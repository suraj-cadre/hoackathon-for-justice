"""seed dispute patterns

Revision ID: 002_seed_patterns
Revises: 001_initial
Create Date: 2026-03-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002_seed_patterns"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEED_PATTERNS = [
    {
        "pattern_name": "Vague Timeframe - Few/Several Days",
        "description": "Contract uses imprecise time references like 'few days', 'several weeks', 'shortly', 'soon' without specifying exact durations.",
        "example_bad": "The project will commence in a few days after signing.",
        "example_good": "The project will commence within 5 business days after signing.",
        "category": "vague_timeframe",
    },
    {
        "pattern_name": "Vague Timeframe - Reasonable Time",
        "description": "Contract uses 'reasonable time' or 'reasonable period' without defining what constitutes reasonable.",
        "example_bad": "The vendor shall deliver within a reasonable time.",
        "example_good": "The vendor shall deliver within 30 calendar days of the purchase order date.",
        "category": "vague_timeframe",
    },
    {
        "pattern_name": "Vague Timeframe - As Soon As Possible",
        "description": "Contract uses 'as soon as possible', 'ASAP', 'promptly' without binding deadlines.",
        "example_bad": "Defects shall be remedied as soon as possible.",
        "example_good": "Defects shall be remedied within 48 hours of written notification.",
        "category": "vague_timeframe",
    },
    {
        "pattern_name": "Undefined Term - Best Efforts",
        "description": "Contract uses 'best efforts' or 'reasonable efforts' without defining the standard of performance expected.",
        "example_bad": "The contractor shall use best efforts to complete the work.",
        "example_good": "The contractor shall complete the work according to the milestones defined in Schedule A, dedicating no fewer than 40 hours per week.",
        "category": "undefined_term",
    },
    {
        "pattern_name": "Undefined Term - Material Breach",
        "description": "Contract references 'material breach' without defining what constitutes materiality.",
        "example_bad": "Either party may terminate upon material breach by the other party.",
        "example_good": "Either party may terminate if the other party: (a) fails to make payment within 15 days of the due date, (b) fails to deliver services for 5 consecutive business days, or (c) breaches any confidentiality obligation.",
        "category": "undefined_term",
    },
    {
        "pattern_name": "Missing Quantity - Approximate Amounts",
        "description": "Contract uses 'approximately', 'about', 'around' for quantities, costs, or measurements without acceptable variance ranges.",
        "example_bad": "The total cost will be approximately $50,000.",
        "example_good": "The total cost shall not exceed $52,500 (base amount of $50,000 plus a 5% contingency).",
        "category": "missing_quantity",
    },
    {
        "pattern_name": "Missing Quantity - Adequate/Sufficient",
        "description": "Contract requires 'adequate' or 'sufficient' resources, staffing, or insurance without specifying minimums.",
        "example_bad": "Contractor shall maintain adequate insurance coverage.",
        "example_good": "Contractor shall maintain general liability insurance with minimum coverage of $2,000,000 per occurrence.",
        "category": "missing_quantity",
    },
    {
        "pattern_name": "Ambiguous Language - May vs Shall",
        "description": "Contract uses 'may' where an obligation is intended, or mixes 'may', 'shall', 'will', and 'should' inconsistently.",
        "example_bad": "The vendor may provide monthly progress reports.",
        "example_good": "The vendor shall provide monthly progress reports by the 5th business day of each month.",
        "category": "ambiguous_language",
    },
    {
        "pattern_name": "Ambiguous Language - Including But Not Limited To",
        "description": "Contract uses 'including but not limited to' which creates an open-ended and potentially unbounded scope of obligations.",
        "example_bad": "Services include but are not limited to consulting, development, and support.",
        "example_good": "Services are limited to: (a) consulting (maximum 20 hours/month), (b) software development per the SOW, and (c) email-based support during business hours.",
        "category": "ambiguous_language",
    },
    {
        "pattern_name": "Ambiguous Language - Mutual Agreement",
        "description": "Contract defers key decisions to 'mutual agreement' without a dispute resolution mechanism if agreement is not reached.",
        "example_bad": "Changes to scope shall be made by mutual agreement.",
        "example_good": "Changes to scope require written agreement signed by both parties. If agreement cannot be reached within 10 business days, the matter shall be escalated to mediation under Section 12.",
        "category": "ambiguous_language",
    },
    {
        "pattern_name": "Unclear Obligation - Passive Voice",
        "description": "Contract uses passive voice that obscures which party is responsible for an obligation.",
        "example_bad": "The deliverables will be reviewed and approved.",
        "example_good": "The Client shall review and approve the deliverables within 10 business days of submission.",
        "category": "unclear_obligation",
    },
    {
        "pattern_name": "Unclear Obligation - Joint Responsibility",
        "description": "Contract assigns responsibility to 'both parties' or 'the parties' without distinguishing individual obligations.",
        "example_bad": "Both parties shall ensure data security.",
        "example_good": "The Vendor shall encrypt all data in transit and at rest. The Client shall restrict access credentials to authorized personnel only.",
        "category": "unclear_obligation",
    },
    {
        "pattern_name": "Vague Timeframe - Periodic Review",
        "description": "Contract mentions 'periodic', 'regular', or 'from time to time' reviews without defining frequency.",
        "example_bad": "Performance shall be reviewed periodically.",
        "example_good": "Performance shall be reviewed quarterly, with formal reviews on the last business day of March, June, September, and December.",
        "category": "vague_timeframe",
    },
    {
        "pattern_name": "Missing Quantity - Satisfaction Clause",
        "description": "Contract conditions acceptance on one party's 'satisfaction' without objective acceptance criteria.",
        "example_bad": "Work shall be completed to the Client's satisfaction.",
        "example_good": "Work shall be deemed accepted if it meets the acceptance criteria defined in Schedule B and passes all test cases listed in the test plan.",
        "category": "missing_quantity",
    },
    {
        "pattern_name": "Undefined Term - Force Majeure Scope",
        "description": "Contract includes a force majeure clause with vague or overly broad triggering events.",
        "example_bad": "Neither party shall be liable for failure due to circumstances beyond their control.",
        "example_good": "Neither party shall be liable for failure caused by: natural disasters, government-imposed restrictions, pandemics declared by WHO, or utility failures lasting more than 72 hours. Financial hardship, market changes, and staffing shortages are expressly excluded.",
        "category": "undefined_term",
    },
    {
        "pattern_name": "Ambiguous Language - Termination for Convenience",
        "description": "Contract allows termination 'for convenience' without specifying notice period, wind-down obligations, or payment for work completed.",
        "example_bad": "Either party may terminate this agreement for convenience.",
        "example_good": "Either party may terminate this agreement for convenience by providing 30 days written notice. Upon termination, the Client shall pay for all work completed through the termination date plus documented wind-down costs.",
        "category": "ambiguous_language",
    },
    {
        "pattern_name": "Missing Quantity - Indemnification Cap",
        "description": "Contract includes indemnification obligations without a liability cap or financial limit.",
        "example_bad": "The Vendor shall indemnify the Client against all claims arising from the services.",
        "example_good": "The Vendor shall indemnify the Client against third-party claims arising from the services, subject to an aggregate liability cap equal to the total fees paid under this agreement in the preceding 12 months.",
        "category": "missing_quantity",
    },
    {
        "pattern_name": "Unclear Obligation - Notification Requirements",
        "description": "Contract requires 'notice' or 'notification' without specifying the method, timing, or recipient.",
        "example_bad": "Party A shall notify Party B of any changes.",
        "example_good": "Party A shall notify Party B in writing via email to the designated contract manager within 5 business days of any material change. Notice is effective upon confirmed receipt.",
        "category": "unclear_obligation",
    },
    {
        "pattern_name": "Undefined Term - Confidential Information",
        "description": "Contract references 'confidential information' without defining its scope or exclusions.",
        "example_bad": "Both parties agree to protect confidential information.",
        "example_good": "Confidential Information means all non-public technical, business, and financial information disclosed under this agreement, excluding information that: (a) is publicly available, (b) was known prior to disclosure, or (c) is independently developed.",
        "category": "undefined_term",
    },
    {
        "pattern_name": "Vague Timeframe - Survival Clause",
        "description": "Contract states obligations 'survive termination' without specifying for how long.",
        "example_bad": "Confidentiality obligations shall survive termination of this agreement.",
        "example_good": "Confidentiality obligations shall survive termination of this agreement for a period of 3 years from the effective date of termination.",
        "category": "vague_timeframe",
    },
]


def upgrade() -> None:
    patterns_table = sa.table(
        "dispute_patterns",
        sa.column("pattern_name", sa.String),
        sa.column("description", sa.Text),
        sa.column("example_bad", sa.Text),
        sa.column("example_good", sa.Text),
        sa.column("category", sa.String),
    )
    op.bulk_insert(patterns_table, SEED_PATTERNS)


def downgrade() -> None:
    op.execute("DELETE FROM dispute_patterns")
