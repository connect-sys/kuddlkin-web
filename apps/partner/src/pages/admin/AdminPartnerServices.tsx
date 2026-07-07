import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tent } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import AdminPartnerServicesTab from '../../components/admin/AdminPartnerServicesTab';
import AdminPartnerCampsTab from '../../components/admin/AdminPartnerCampsTab';

const AdminPartnerServices: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerInfo();
  }, [partnerId]);

  const fetchPartnerInfo = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPartnerInfo(data.partner);
      }
    } catch (error) {
      console.error('Error fetching partner info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partners
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#578f82]">
            Manage Services & Camps
          </h1>
          <p className="text-gray-600">
            {partnerInfo?.name || partnerInfo?.business_name || 'Partner'} - {partnerInfo?.email}
          </p>
        </div>
      </div>

      {/* Tabs for Services and Camps */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="camps" className="flex items-center gap-2">
                <Tent className="w-4 h-4" />
                Camps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <AdminPartnerServicesTab partnerId={partnerId!} partnerData={partnerInfo} />
            </TabsContent>

            <TabsContent value="camps">
              <AdminPartnerCampsTab partnerId={partnerId!} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPartnerServices;
