/**
 * LIDO-Style Dispatch Release PDF Generator
 * Professional flight dispatch document following Lufthansa Systems LIDO format
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { DispatchRelease } from '@/types/flight';

// ============================================================================
// LIDO STYLES - Industry Standard Format
// ============================================================================

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 8,
        fontFamily: 'Courier',
        backgroundColor: '#ffffff',
    },
    
    // Header Section (LIDO Style)
    header: {
        marginBottom: 10,
        borderBottom: '2 solid #000',
        paddingBottom: 5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
    },
    releaseNumber: {
        fontSize: 10,
        fontFamily: 'Courier-Bold',
    },
    
    // Flight Info Box (LIDO Style)
    flightInfoBox: {
        border: '2 solid #000',
        padding: 8,
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
    },
    flightInfoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    flightInfoLabel: {
        width: 80,
        fontFamily: 'Courier-Bold',
        fontSize: 9,
    },
    flightInfoValue: {
        fontFamily: 'Courier',
        fontSize: 9,
    },
    
    // Route Section (LIDO Style)
    routeBox: {
        border: '1 solid #000',
        padding: 6,
        marginBottom: 8,
    },
    routeHeader: {
        fontSize: 9,
        fontFamily: 'Courier-Bold',
        marginBottom: 4,
        textDecoration: 'underline',
    },
    routeLine: {
        fontFamily: 'Courier',
        fontSize: 8,
        marginBottom: 2,
    },
    airportLine: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    airportCode: {
        width: 50,
        fontFamily: 'Courier-Bold',
        fontSize: 9,
    },
    airportName: {
        fontFamily: 'Courier',
        fontSize: 8,
        color: '#333',
    },
    
    // Fuel Table (LIDO Style)
    fuelSection: {
        marginBottom: 10,
    },
    fuelTable: {
        border: '1 solid #000',
    },
    fuelTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#000',
        color: '#fff',
        padding: 4,
        fontFamily: 'Courier-Bold',
        fontSize: 8,
    },
    fuelTableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #ccc',
        padding: 4,
    },
    fuelTableRowTotal: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        padding: 4,
        fontFamily: 'Courier-Bold',
        borderTop: '2 solid #000',
    },
    fuelCell: {
        flex: 1,
        fontFamily: 'Courier',
        fontSize: 8,
    },
    fuelCellBold: {
        flex: 1,
        fontFamily: 'Courier-Bold',
        fontSize: 8,
    },
    
    // Weather Section (LIDO Style)
    weatherBox: {
        border: '1 solid #000',
        padding: 6,
        marginBottom: 8,
        backgroundColor: '#fafafa',
    },
    weatherHeader: {
        fontFamily: 'Courier-Bold',
        fontSize: 9,
        marginBottom: 4,
    },
    weatherText: {
        fontFamily: 'Courier',
        fontSize: 7,
        marginBottom: 2,
        lineHeight: 1.3,
    },
    
    // Performance Data (LIDO Style)
    perfBox: {
        border: '1 solid #000',
        padding: 6,
        marginBottom: 8,
    },
    perfRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    perfLabel: {
        fontFamily: 'Courier-Bold',
        fontSize: 8,
    },
    perfValue: {
        fontFamily: 'Courier',
        fontSize: 8,
    },
    
    // Signature Section (LIDO Style)
    signatureSection: {
        marginTop: 15,
        borderTop: '1 solid #000',
        paddingTop: 10,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        border: '1 solid #000',
        padding: 8,
        minHeight: 60,
    },
    signatureLabel: {
        fontFamily: 'Courier-Bold',
        fontSize: 7,
        marginBottom: 25,
    },
    signatureLine: {
        borderTop: '1 solid #000',
        paddingTop: 3,
    },
    signatureName: {
        fontFamily: 'Courier',
        fontSize: 7,
    },
    signatureDate: {
        fontFamily: 'Courier',
        fontSize: 6,
        color: '#666',
        marginTop: 2,
    },
    
    // Footer (LIDO Style)
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        borderTop: '1 solid #000',
        paddingTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 6,
        fontFamily: 'Courier',
        color: '#666',
    },
    
    // Data Grid (LIDO Style)
    dataGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dataGridItem: {
        width: '48%',
        marginBottom: 6,
    },
    dataLabel: {
        fontFamily: 'Courier-Bold',
        fontSize: 7,
        color: '#666',
    },
    dataValue: {
        fontFamily: 'Courier',
        fontSize: 9,
        marginTop: 1,
    },
});

// ============================================================================
// COMPONENT
// ============================================================================

interface DispatchReleasePDFProps {
    release: DispatchRelease;
}

export const DispatchReleaseLIDO: React.FC<DispatchReleasePDFProps> = ({ release }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
        }).toUpperCase();
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
    };

    const formatFuel = (gallons: number) => {
        return `${gallons.toLocaleString()} GAL / ${Math.round(gallons * 3.785)} LTR`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* LIDO Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.companyName}>LEVANT VIRTUAL AIRLINE</Text>
                        <Text style={styles.releaseNumber}>OFP #{release.releaseNumber}</Text>
                    </View>
                    <View style={styles.headerRow}>
                        <Text style={styles.footerText}>OPERATIONAL FLIGHT PLAN</Text>
                        <Text style={styles.footerText}>GENERATED: {formatDate(release.generatedAt)}</Text>
                    </View>
                </View>

                {/* Flight Information Box */}
                <View style={styles.flightInfoBox}>
                    <View style={styles.flightInfoRow}>
                        <Text style={styles.flightInfoLabel}>FLIGHT:</Text>
                        <Text style={styles.flightInfoValue}>{release.callsign}</Text>
                        <Text style={styles.flightInfoLabel}>AIRCRAFT:</Text>
                        <Text style={styles.flightInfoValue}>{release.aircraft.type} ({release.registration})</Text>
                    </View>
                    <View style={styles.flightInfoRow}>
                        <Text style={styles.flightInfoLabel}>CAPTAIN:</Text>
                        <Text style={styles.flightInfoValue}>{release.captain}</Text>
                        <Text style={styles.flightInfoLabel}>DISPATCHER:</Text>
                        <Text style={styles.flightInfoValue}>{release.dispatcher}</Text>
                    </View>
                    <View style={styles.flightInfoRow}>
                        <Text style={styles.flightInfoLabel}>DATE:</Text>
                        <Text style={styles.flightInfoValue}>{formatDate(release.scheduledDeparture)}</Text>
                        <Text style={styles.flightInfoLabel}>ETD:</Text>
                        <Text style={styles.flightInfoValue}>{formatTime(new Date(release.scheduledDeparture).getUTCHours() * 60 + new Date(release.scheduledDeparture).getUTCMinutes())}Z</Text>
                    </View>
                </View>

                {/* Route Information */}
                <View style={styles.routeBox}>
                    <Text style={styles.routeHeader}>ROUTE OF FLIGHT</Text>
                    
                    <View style={styles.airportLine}>
                        <Text style={styles.airportCode}>{release.departure.icao}</Text>
                        <Text style={styles.airportName}>{release.departure.name}</Text>
                    </View>
                    
                    <Text style={styles.routeLine}>
                        {release.route}
                    </Text>
                    
                    <View style={styles.airportLine}>
                        <Text style={styles.airportCode}>{release.arrival.icao}</Text>
                        <Text style={styles.airportName}>{release.arrival.name}</Text>
                    </View>
                    
                    {release.alternate && (
                        <View style={styles.airportLine}>
                            <Text style={styles.airportCode}>ALT: {release.alternate.icao}</Text>
                            <Text style={styles.airportName}>{release.alternate.name}</Text>
                        </View>
                    )}
                </View>

                {/* Performance Data */}
                <View style={styles.perfBox}>
                    <View style={styles.perfRow}>
                        <Text style={styles.perfLabel}>CRUISE ALTITUDE:</Text>
                        <Text style={styles.perfValue}>FL{Math.floor(release.cruiseAltitude / 100)}</Text>
                        <Text style={styles.perfLabel}>CRUISE SPEED:</Text>
                        <Text style={styles.perfValue}>{release.cruiseSpeed} KTS</Text>
                    </View>
                    <View style={styles.perfRow}>
                        <Text style={styles.perfLabel}>DISTANCE:</Text>
                        <Text style={styles.perfValue}>{release.distance} NM</Text>
                        <Text style={styles.perfLabel}>EST FLIGHT TIME:</Text>
                        <Text style={styles.perfValue}>{formatTime(release.estimatedDuration)}</Text>
                    </View>
                    <View style={styles.perfRow}>
                        <Text style={styles.perfLabel}>ETA:</Text>
                        <Text style={styles.perfValue}>{formatTime(new Date(release.estimatedArrival).getUTCHours() * 60 + new Date(release.estimatedArrival).getUTCMinutes())}Z</Text>
                        <Text style={styles.perfLabel}>VALID UNTIL:</Text>
                        <Text style={styles.perfValue}>{formatDate(release.validUntil)}</Text>
                    </View>
                </View>

                {/* Fuel Plan Table */}
                <View style={styles.fuelSection}>
                    <View style={styles.fuelTable}>
                        <View style={styles.fuelTableHeader}>
                            <Text style={[styles.fuelCell, { flex: 2 }]}>FUEL ITEM</Text>
                            <Text style={styles.fuelCell}>GALLONS</Text>
                            <Text style={styles.fuelCell}>LITERS</Text>
                        </View>
                        
                        <View style={styles.fuelTableRow}>
                            <Text style={[styles.fuelCell, { flex: 2 }]}>TRIP FUEL</Text>
                            <Text style={styles.fuelCell}>{release.fuelPlan.tripFuel.toLocaleString()}</Text>
                            <Text style={styles.fuelCell}>{Math.round(release.fuelPlan.tripFuel * 3.785).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.fuelTableRow}>
                            <Text style={[styles.fuelCell, { flex: 2 }]}>CONTINGENCY (5%)</Text>
                            <Text style={styles.fuelCell}>{release.fuelPlan.contingency.toLocaleString()}</Text>
                            <Text style={styles.fuelCell}>{Math.round(release.fuelPlan.contingency * 3.785).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.fuelTableRow}>
                            <Text style={[styles.fuelCell, { flex: 2 }]}>ALTERNATE</Text>
                            <Text style={styles.fuelCell}>{release.fuelPlan.alternate.toLocaleString()}</Text>
                            <Text style={styles.fuelCell}>{Math.round(release.fuelPlan.alternate * 3.785).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.fuelTableRow}>
                            <Text style={[styles.fuelCell, { flex: 2 }]}>FINAL RESERVE</Text>
                            <Text style={styles.fuelCell}>{release.fuelPlan.finalReserve.toLocaleString()}</Text>
                            <Text style={styles.fuelCell}>{Math.round(release.fuelPlan.finalReserve * 3.785).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.fuelTableRow}>
                            <Text style={[styles.fuelCell, { flex: 2 }]}>TAXI</Text>
                            <Text style={styles.fuelCell}>{release.fuelPlan.taxi.toLocaleString()}</Text>
                            <Text style={styles.fuelCell}>{Math.round(release.fuelPlan.taxi * 3.785).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.fuelTableRowTotal}>
                            <Text style={[styles.fuelCellBold, { flex: 2 }]}>BLOCK FUEL</Text>
                            <Text style={styles.fuelCellBold}>{release.fuelPlan.plannedOnboard.toLocaleString()}</Text>
                            <Text style={styles.fuelCellBold}>{Math.round(release.fuelPlan.plannedOnboard * 3.785).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Weather Information */}
                {(release.departureMetar || release.arrivalMetar) && (
                    <View style={styles.weatherBox}>
                        <Text style={styles.weatherHeader}>WEATHER</Text>
                        
                        {release.departureMetar && (
                            <View>
                                <Text style={styles.weatherText}>
                                    {release.departure.icao} METAR: {release.departureMetar.rawText}
                                </Text>
                            </View>
                        )}
                        
                        {release.arrivalMetar && (
                            <View>
                                <Text style={styles.weatherText}>
                                    {release.arrival.icao} METAR: {release.arrivalMetar.rawText}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>CAPTAIN SIGNATURE</Text>
                            <View style={styles.signatureLine}>
                                <Text style={styles.signatureName}>{release.captain}</Text>
                                <Text style={styles.signatureDate}>DATE: _______________</Text>
                            </View>
                        </View>
                        
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>DISPATCHER SIGNATURE</Text>
                            <View style={styles.signatureLine}>
                                <Text style={styles.signatureName}>{release.dispatcher}</Text>
                                <Text style={styles.signatureDate}>DATE: _______________</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        LEVANT VIRTUAL AIRLINE - OPERATIONAL FLIGHT PLAN
                    </Text>
                    <Text style={styles.footerText}>
                        OFP #{release.releaseNumber} - PAGE 1/1
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default DispatchReleaseLIDO;
