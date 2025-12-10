using System;

public class Utilities
{


    public static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        double latRad1 = lat1 * System.Math.PI / 180.0;
        double lonRad1 = lon1 * System.Math.PI / 180.0;
        double latRad2 = lat2 * System.Math.PI / 180.0;
        double lonRad2 = lon2 * System.Math.PI / 180.0;

        double dLat = latRad2 - latRad1;
        double dLon = lonRad2 - lonRad1;

        double a = System.Math.Sin(dLat / 2) * System.Math.Sin(dLat / 2) +
                     System.Math.Cos(latRad1) * System.Math.Cos(latRad2) *
                    System.Math.Sin(dLon / 2) * System.Math.Sin(dLon / 2);

        double c = 2 * System.Math.Atan2(System.Math.Sqrt(a), System.Math.Sqrt(1 - a));

        return R * c * 1000; // distance in meters
    }
    public static bool IsEnterArea(double Distance,double Radius)
    {
        return Distance <= Radius;
    }
}