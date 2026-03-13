import discord
from typing import List, Set
import config

def get_roles_for_ratings(atc_rating: int, pilot_rating: int) -> List[int]:
    """Get list of role IDs based on IVAO ratings
    
    ATC Ratings: 2-4 (AS1-AS3), 5-7 (ADC-ACC) → ADIR, 8-10 (SEC-CAI) → DIR
    Pilot Ratings: 2-4 (FS1-FS3), 5-6 (PP-SPP) → AWM, 7-8 (CP-ATP) → WM, 9 (SFI) → FM, 10 (CFI) → AFM
    """
    roles_to_assign: Set[int] = set()
    
    # Always add Levant Members role
    if config.ROLES['LEVANT_MEMBERS']:
        roles_to_assign.add(config.ROLES['LEVANT_MEMBERS'])
    
    # ATC rating roles
    atc_info = config.ATC_RATINGS.get(atc_rating)
    if atc_info and atc_info['role_key']:
        role_id = config.ROLES.get(atc_info['role_key'])
        if role_id:
            roles_to_assign.add(role_id)
    
    # Pilot rating roles
    pilot_info = config.PILOT_RATINGS.get(pilot_rating)
    if pilot_info and pilot_info['role_key']:
        role_id = config.ROLES.get(pilot_info['role_key'])
        if role_id:
            roles_to_assign.add(role_id)
    
    return list(roles_to_assign)

async def assign_roles_to_member(member: discord.Member, atc_rating: int, pilot_rating: int) -> dict:
    """Assign roles to a Discord member based on IVAO ratings"""
    try:
        roles_to_assign = get_roles_for_ratings(atc_rating, pilot_rating)
        
        # Get current role IDs
        current_role_ids = [role.id for role in member.roles]
        
        # Filter out roles already assigned
        new_role_ids = [role_id for role_id in roles_to_assign if role_id not in current_role_ids]
        
        if new_role_ids:
            # Get role objects
            roles = [member.guild.get_role(role_id) for role_id in new_role_ids]
            roles = [role for role in roles if role is not None]
            
            if roles:
                await member.add_roles(*roles)
                print(f'Assigned {len(roles)} role(s) to {member.name}')
                return {
                    'success': True,
                    'roles_assigned': len(roles),
                    'roles': new_role_ids
                }
        
        print(f'No new roles to assign to {member.name}')
        return {
            'success': True,
            'roles_assigned': 0,
            'roles': []
        }
    except Exception as e:
        print(f'Error assigning roles: {e}')
        return {
            'success': False,
            'error': str(e)
        }

def get_rating_name(rating_type: str, rating: int) -> str:
    """Get rating name from rating number"""
    if rating_type == 'atc':
        info = config.ATC_RATINGS.get(rating)
        return info['name'] if info else 'Unknown'
    elif rating_type == 'pilot':
        info = config.PILOT_RATINGS.get(rating)
        return info['name'] if info else 'Unknown'
    return 'Unknown'
