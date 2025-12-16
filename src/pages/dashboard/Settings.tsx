import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, changePassword, uploadAvatar } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Camera,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Download,
  Github,
  ExternalLink,
  Eye,
  EyeOff,
  Activity,
  Settings as SettingsIcon,
  Palette,
  Code,
  Webhook,
} from "lucide-react";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [buildAlerts, setBuildAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Appearance
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, US",
      current: true,
      lastActive: "Now",
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, US",
      current: false,
      lastActive: "2 hours ago",
    },
    {
      id: 3,
      device: "Firefox on MacOS",
      location: "Boston, US",
      current: false,
      lastActive: "3 days ago",
    },
  ]);

  // Integrations
  const [connectedApps] = useState([
    { id: "github", name: "GitHub", connected: true, icon: Github },
    { id: "slack", name: "Slack", connected: false, icon: Activity },
  ]);

  // Profile completeness
  const profileFields = [
    { name: "First Name", filled: !!firstName },
    { name: "Last Name", filled: !!lastName },
    { name: "Email", filled: !!email },
    { name: "Avatar", filled: !!user?.avatar },
    { name: "Email Verified", filled: !!user?.email_verified_at },
  ];
  const completedFields = profileFields.filter((f) => f.filled).length;
  const profileCompleteness = Math.round(
    (completedFields / profileFields.length) * 100
  );

  // Password strength
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    return score;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30)
      return { label: "Weak", color: "text-destructive" };
    if (passwordStrength < 60)
      return { label: "Fair", color: "text-orange-500" };
    if (passwordStrength < 80) return { label: "Good", color: "text-primary" };
    return { label: "Strong", color: "text-green-500" };
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const response = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
      });

      if (response.status === "success" && response.data?.user) {
        updateUser(response.data.user);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        const errorMessage = response.errors
          ? Object.values(response.errors).flat().join(". ")
          : response.message;
        toast({
          variant: "destructive",
          title: "Update failed",
          description: errorMessage,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePassword(currentPassword, newPassword);

      if (response.status === "success") {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          variant: "destructive",
          title: "Password change failed",
          description:
            response.message || "Please check your current password.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change password. Please try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadAvatar(file);
      if (response.status === "success" && response.data?.user) {
        updateUser(response.data.user);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: response.message || "Failed to upload avatar.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
      });
    }
  };

  return (
    <div className='space-y-6 max-w-4xl'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground flex items-center gap-2'>
            <SettingsIcon className='h-6 w-6 text-primary' />
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account and preferences
          </p>
        </div>
        <Badge
          variant='outline'
          className='bg-primary/10 text-primary border-primary/30'
        >
          {profileCompleteness}% Complete
        </Badge>
      </div>

      {/* Profile Completeness */}
      {profileCompleteness < 100 && (
        <Card className='bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/30'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='font-semibold text-foreground'>
                  Complete Your Profile
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {5 - completedFields} items remaining
                </p>
              </div>
              <span className='text-2xl font-bold text-primary'>
                {profileCompleteness}%
              </span>
            </div>
            <Progress value={profileCompleteness} className='h-2' />
            <div className='flex flex-wrap gap-2 mt-4'>
              {profileFields
                .filter((f) => !f.filled)
                .map((field) => (
                  <Badge key={field.name} variant='outline' className='text-xs'>
                    {field.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='profile' className='gap-2'>
            <User className='h-4 w-4' />
            <span className='hidden sm:inline'>Profile</span>
          </TabsTrigger>
          <TabsTrigger value='security' className='gap-2'>
            <Shield className='h-4 w-4' />
            <span className='hidden sm:inline'>Security</span>
          </TabsTrigger>
          <TabsTrigger value='notifications' className='gap-2'>
            <Bell className='h-4 w-4' />
            <span className='hidden sm:inline'>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value='appearance' className='gap-2'>
            <Palette className='h-4 w-4' />
            <span className='hidden sm:inline'>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value='integrations' className='gap-2'>
            <Code className='h-4 w-4' />
            <span className='hidden sm:inline'>Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value='profile' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className='space-y-6'>
                {/* Avatar */}
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <Avatar className='h-20 w-20'>
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback className='bg-primary text-primary-foreground text-xl'>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor='avatar-upload'
                      className='absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors'
                    >
                      <Camera className='h-4 w-4' />
                    </label>
                    <input
                      id='avatar-upload'
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      @{user?.username}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Member since{" "}
                      {new Date(
                        user?.created_at || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form fields */}
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input
                      id='firstName'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className='bg-muted/50'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input
                      id='lastName'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className='bg-muted/50'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='bg-muted/50'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='bg-muted/50'
                    />
                    {user?.email_verified_at ? (
                      <Badge
                        variant='outline'
                        className='bg-green-500/20 text-green-500 border-green-500/30 shrink-0'
                      >
                        <CheckCircle className='h-3 w-3 mr-1' />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='bg-destructive/20 text-destructive border-destructive/30 shrink-0'
                      >
                        <AlertTriangle className='h-3 w-3 mr-1' />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <Button type='submit' disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className='border-destructive/50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-destructive'>
                <Trash2 className='h-5 w-5' />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div>
                  <p className='font-medium text-foreground'>
                    Export Your Data
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Download a copy of all your data
                  </p>
                </div>
                <Button
                  variant='outline'
                  onClick={() =>
                    toast({
                      title: "Export started",
                      description: "You'll receive an email when ready.",
                    })
                  }
                >
                  <Download className='h-4 w-4 mr-2' />
                  Export
                </Button>
              </div>
              <div className='flex items-center justify-between p-4 rounded-lg border border-destructive/30'>
                <div>
                  <p className='font-medium text-foreground'>Delete Account</p>
                  <p className='text-sm text-muted-foreground'>
                    Permanently delete your account and all data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive'>Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Lock className='h-5 w-5' />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='currentPassword'>Current Password</Label>
                  <div className='relative'>
                    <Input
                      id='currentPassword'
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className='bg-muted/50 pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3'
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='newPassword'>New Password</Label>
                    <div className='relative'>
                      <Input
                        id='newPassword'
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className='bg-muted/50 pr-10'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute right-0 top-0 h-full px-3'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    {newPassword && (
                      <div className='space-y-1'>
                        <Progress value={passwordStrength} className='h-1' />
                        <p
                          className={`text-xs ${
                            getPasswordStrengthLabel().color
                          }`}
                        >
                          Password strength: {getPasswordStrengthLabel().label}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>
                      Confirm New Password
                    </Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='bg-muted/50'
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className='text-xs text-destructive'>
                        Passwords don't match
                      </p>
                    )}
                  </div>
                </div>
                <Button type='submit' disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Key className='h-5 w-5' />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      twoFactorEnabled ? "bg-green-500/20" : "bg-muted"
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 ${
                        twoFactorEnabled
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      Authenticator App
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {twoFactorEnabled
                        ? "Enabled - Your account is protected"
                        : "Not enabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setTwoFactorEnabled(checked);
                    toast({
                      title: checked ? "2FA Enabled" : "2FA Disabled",
                      description: checked
                        ? "Your account is now more secure."
                        : "Two-factor authentication has been disabled.",
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices where you're logged in
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className='flex items-center justify-between p-4 rounded-lg border border-border'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                      <Monitor className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-foreground'>
                          {session.device}
                        </p>
                        {session.current && (
                          <Badge
                            variant='outline'
                            className='bg-green-500/20 text-green-500 border-green-500/30 text-xs'
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:text-destructive'
                      onClick={() =>
                        toast({
                          title: "Session revoked",
                          description: "Device has been logged out.",
                        })
                      }
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                    <Mail className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      Email Notifications
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                    <Bell className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      Push Notifications
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Browser notifications for important updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                    <AlertTriangle className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>Build Alerts</p>
                    <p className='text-sm text-muted-foreground'>
                      Get notified when builds fail
                    </p>
                  </div>
                </div>
                <Switch
                  checked={buildAlerts}
                  onCheckedChange={setBuildAlerts}
                />
              </div>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                    <Activity className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      Weekly Reports
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Receive weekly testing summaries
                    </p>
                  </div>
                </div>
                <Switch
                  checked={weeklyReports}
                  onCheckedChange={setWeeklyReports}
                />
              </div>
              <div className='flex items-center justify-between p-4 rounded-lg border border-border'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                    <Webhook className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>
                      Slack Notifications
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Get alerts in your Slack workspace
                    </p>
                  </div>
                </div>
                <Switch
                  checked={slackNotifications}
                  onCheckedChange={setSlackNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value='appearance' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Palette className='h-5 w-5' />
                Appearance
              </CardTitle>
              <CardDescription>Customize how BuildIQ looks</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <Label>Theme</Label>
                <div className='grid grid-cols-3 gap-4'>
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      className='h-24 flex-col gap-2'
                      onClick={() => {
                        setTheme(option.value);
                        toast({
                          title: "Theme updated",
                          description: `Switched to ${option.label} theme.`,
                        });
                      }}
                    >
                      <option.icon className='h-6 w-6' />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className='w-full'>
                    <Globe className='h-4 w-4 mr-2' />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='es'>Español</SelectItem>
                    <SelectItem value='fr'>Français</SelectItem>
                    <SelectItem value='de'>Deutsch</SelectItem>
                    <SelectItem value='ja'>日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value='integrations' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Code className='h-5 w-5' />
                Connected Apps
              </CardTitle>
              <CardDescription>Manage third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {connectedApps.map((app) => (
                <div
                  key={app.id}
                  className='flex items-center justify-between p-4 rounded-lg border border-border'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        app.connected ? "bg-green-500/20" : "bg-muted"
                      }`}
                    >
                      <app.icon
                        className={`h-5 w-5 ${
                          app.connected
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>{app.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {app.connected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={app.connected ? "outline" : "default"}
                    onClick={() => {
                      toast({
                        title: app.connected
                          ? `${app.name} disconnected`
                          : `${app.name} connected`,
                        description: app.connected
                          ? "Integration has been removed."
                          : "Integration successful!",
                      });
                    }}
                  >
                    {app.connected ? "Disconnect" : "Connect"}
                    <ExternalLink className='h-4 w-4 ml-2' />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Key className='h-5 w-5' />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API access tokens</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-4 rounded-lg border border-border bg-muted/30'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-foreground'>
                      Production Key
                    </p>
                    <p className='text-sm text-muted-foreground font-mono'>
                      biq_prod_**********************
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        toast({
                          title: "Copied!",
                          description: "API key copied to clipboard.",
                        })
                      }
                    >
                      Copy
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:text-destructive'
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant='outline' className='w-full'>
                <Key className='h-4 w-4 mr-2' />
                Generate New API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
