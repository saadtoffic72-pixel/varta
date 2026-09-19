import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import AlertBulletin, CoastalZone
from app.models.cyclone import Cyclone, TrackPoint
from app.schemas.alert import AlertBulletinResponse, CoastalZoneResponse, GenerateAlertRequest

class AlertService:
    @staticmethod
    async def get_active_alerts(db: AsyncSession) -> List[AlertBulletinResponse]:
        stmt = select(AlertBulletin).where(AlertBulletin.is_active == True).order_by(desc(AlertBulletin.bulletin_number))
        res = await db.execute(stmt)
        bulletins = res.scalars().all()
        
        response_list = []
        for b in bulletins:
            # fetch cyclone name
            c_stmt = select(Cyclone.name).where(Cyclone.id == b.cyclone_id)
            c_res = await db.execute(c_stmt)
            c_name = c_res.scalar_one_or_none()
            
            resp = AlertBulletinResponse.model_validate(b)
            resp.cyclone_name = c_name or "Unknown Storm"
            response_list.append(resp)
            
        return response_list

    @staticmethod
    async def get_coastal_zones(db: AsyncSession) -> List[CoastalZoneResponse]:
        stmt = select(CoastalZone).order_by(desc(CoastalZone.vulnerability_index))
        res = await db.execute(stmt)
        zones = res.scalars().all()
        return [CoastalZoneResponse.model_validate(z) for z in zones]

    @staticmethod
    async def generate_bulletin(request: GenerateAlertRequest, db: AsyncSession) -> AlertBulletinResponse:
        c_stmt = select(Cyclone).where(Cyclone.id == request.cyclone_id)
        c_res = await db.execute(c_stmt)
        cyclone = c_res.scalar_one_or_none()
        if not cyclone:
            raise ValueError(f"Cyclone with ID {request.cyclone_id} not found")

        # Get latest track point
        pt_stmt = select(TrackPoint).where(TrackPoint.cyclone_id == cyclone.id).order_by(desc(TrackPoint.timestamp))
        pt_res = await db.execute(pt_stmt)
        latest_pt = pt_res.scalars().first()

        wind_kts = latest_pt.wind_speed_knots if latest_pt else cyclone.peak_wind_speed_knots
        wind_kmh = round(wind_kts * 1.852, 1)

        # Count existing bulletins for numbering
        count_stmt = select(AlertBulletin).where(AlertBulletin.cyclone_id == cyclone.id)
        count_res = await db.execute(count_stmt)
        bulletin_no = len(count_res.scalars().all()) + 1

        # Determine alert level if not overridden
        if request.alert_level:
            level = request.alert_level
        else:
            if wind_kmh >= 120 or (latest_pt and latest_pt.latitude >= 19.0):
                level = "Red"
            elif wind_kmh >= 90:
                level = "Orange"
            elif wind_kmh >= 60:
                level = "Yellow"
            else:
                level = "Green"

        # Formulate recommendations based on level
        if level == "Red":
            recommendations = (
                "1. Total suspension of fishing operations and coastal marine activities.\n"
                "2. Mandatory evacuation of all thatched houses and low-lying coastal tracts within 5 km of shoreline.\n"
                "3. Movement of emergency power generators and mobile medical units to cyclone multi-purpose shelters.\n"
                "4. Major ports (Paradip, Dhamra, Haldia) to display Great Danger Signal No. 10.\n"
                "5. Rail and road traffic diversions along coastal National Highways."
            )
            states = "Odisha, West Bengal"
            districts = "Balasore, Bhadrak, Kendrapara, Jagatsinghpur, East Medinipur, South 24 Parganas"
            surge_m = 3.5
            landfall_loc = "Odisha-West Bengal Coast between Dhamra and Sagar Island"
        elif level == "Orange":
            recommendations = (
                "1. Fishermen strongly advised not to venture into deep sea areas.\n"
                "2. Civil administration and NDRF battalions placed on active standby.\n"
                "3. Precautionary de-watering pumps readied in low-lying urban areas.\n"
                "4. Ports instructed to hoist Local Warning Signal No. 4."
            )
            states = "Odisha, Andhra Pradesh, West Bengal"
            districts = "Ganjam, Puri, Jagatsinghpur, Kendrapara, Balasore"
            surge_m = 2.0
            landfall_loc = "Approaching North Odisha / Gangetic West Bengal"
        elif level == "Yellow":
            recommendations = (
                "1. Coastal communities advised to monitor official IMD and NDMA radio broadcasts.\n"
                "2. Fishermen out at deep sea requested to return to coastal harbors immediately.\n"
                "3. District disaster management control rooms activated 24x7."
            )
            states = "Andhra Pradesh, Odisha"
            districts = "Srikakulam, Vizianagaram, Visakhapatnam, Ganjam"
            surge_m = 1.0
            landfall_loc = "Under active observation over central Bay of Bengal"
        else:
            recommendations = (
                "1. Atmospheric low pressure under routine satellite surveillance.\n"
                "2. Standard seasonal readiness protocols remain in effect."
            )
            states = "Coastal Maritime States"
            districts = "All North Indian Ocean coastal zones"
            surge_m = 0.5
            landfall_loc = "No immediate coastal threat"

        cap_id = f"IN-IMD-CAP-{datetime.utcnow().strftime('%Y%m%d')}-{cyclone.code}-{bulletin_no:02d}-{uuid.uuid4().hex[:6].upper()}"

        new_bulletin = AlertBulletin(
            cyclone_id=cyclone.id,
            bulletin_number=bulletin_no,
            alert_level=level,
            issue_time=datetime.utcnow(),
            expected_landfall_time=datetime.utcnow(),
            expected_landfall_location=landfall_loc,
            expected_wind_speed_kmh=wind_kmh,
            surge_height_meters=surge_m,
            affected_states=states,
            affected_districts=districts,
            safety_recommendations=recommendations,
            cap_identifier=cap_id,
            is_active=True
        )

        db.add(new_bulletin)
        await db.commit()
        await db.refresh(new_bulletin)

        resp = AlertBulletinResponse.model_validate(new_bulletin)
        resp.cyclone_name = cyclone.name
        return resp

alert_service = AlertService()
