import Property from '../models/Property.js';
// import distanceService from '../services/distanceService.js';

export const getPropertySummaries = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Extract search and filter parameters
        const { search, listingType, location, minPrice, maxPrice, minBedrooms, maxBedrooms, userLat, userLng } = req.query;

        // Build filter object
        const filter = {};

        // Filter by listing type (to buy or to rent)
        if (listingType && ['to-buy', 'to-rent'].includes(listingType)) {
            filter.listingType = listingType;
        }

        // Filter by location (city/town or address)
        if (location) {
            filter.$or = [
                { cityOrTown: { $regex: location, $options: 'i' } },
                { address: { $regex: location, $options: 'i' } },
                { addressLine1: { $regex: location, $options: 'i' } }
            ];
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.monthlyRent = {};
            if (minPrice) filter.monthlyRent.$gte = parseFloat(minPrice);
            if (maxPrice) filter.monthlyRent.$lte = parseFloat(maxPrice);
        }

        // Filter by number of bedrooms
        if (minBedrooms || maxBedrooms) {
            filter.bedrooms = {};
            if (minBedrooms) filter.bedrooms.$gte = parseInt(minBedrooms);
            if (maxBedrooms) filter.bedrooms.$lte = parseInt(maxBedrooms);
        }

        // Search functionality (searches across multiple fields)
        if (search) {
            const searchFilter = {
                $or: [
                    { propertyName: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } },
                    { cityOrTown: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };

            // Merge search filter with existing filters
            if (Object.keys(filter).length > 0) {
                filter.$and = [searchFilter, filter];
                delete filter.$or; // Remove the location $or since it's now in $and
            } else {
                Object.assign(filter, searchFilter);
            }
        }

        // Fetch total count for pagination with filters
        const total = await Property.countDocuments(filter);

        // Fetch paginated properties with filters
        const properties = await Property.find(filter, {
            propertyName: 1,
            propertyType: 1,
            address: 1,
            frontImage: 1,
            bedrooms: 1,
            amenities: 1,
            monthlyRent: 1,
            listingType: 1,
            cityOrTown: 1,
            coordinates: 1
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate distances if user location is provided
        // let propertiesWithDistance = properties;
        // if (userLat && userLng) {
        //     const userLocation = {
        //         latitude: parseFloat(userLat),
        //         longitude: parseFloat(userLng)
        //     };
        //     propertiesWithDistance = await distanceService.calculateDistancesForProperties(userLocation, properties);
        // }

        const summaries = propertiesWithDistance.map(p => ({
            propertyName: p.propertyName,
            propertyType: p.propertyType,
            address: p.address,
            frontImage: p.frontImage,
            bedrooms: p.bedrooms,
            monthlyRent: p.monthlyRent,
            listingType: p.listingType,
            cityOrTown: p.cityOrTown,
            ensuiteCount: 0, // Replace with p.ensuiteBedrooms or similar if available
            amenities: p.amenities,
            distance: p.distance // Include distance information
        }));

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            properties: summaries,
            filters: {
                search: search || null,
                listingType: listingType || null,
                location: location || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                minBedrooms: minBedrooms || null,
                maxBedrooms: maxBedrooms || null
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPropertyDetailById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userLat, userLng } = req.query;
        const p = await Property.findById(id, {
            propertyName: 1,
            description: 1,
            address: 1,
            billsIncluded: 1,
            bedrooms: 1,
            bathrooms: 1,
            amenities: 1,
            landlord: 1,
            coordinates: 1
        })
            .populate('landlord', 'firstName lastName email phoneNumber')
            .lean();

        if (!p) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Calculate distance if user location is provided
        // let distance = null;
        // if (userLat && userLng && p.coordinates) {
        //     const userLocation = {
        //         latitude: parseFloat(userLat),
        //         longitude: parseFloat(userLng)
        //     };
        //     distance = await distanceService.calculateDistance(userLocation, p.coordinates);
        // }

        const detail = {
            propertyName: p.propertyName,
            description: p.description,
            address: p.address,
            billsIncluded: p.billsIncluded,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            facilities: p.amenities,
           // distance: distance, // Include distance information
            landlord: p.landlord ? {
                name: `${p.landlord.firstName} ${p.landlord.lastName}`,
                email: p.landlord.email,
                phoneNumber: p.landlord.phoneNumber
            } : null
        };
        res.json(detail);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
